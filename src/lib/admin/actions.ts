"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { Field, Resource } from "@/lib/admin/resources";
import { guard, refreshPublic } from "@/lib/admin/helpers";
import { removeStorage } from "@/lib/admin/storage";
import { parseMedia, syncChildren } from "@/lib/admin/media-sync";
import { slugify } from "@/lib/format";

export type FormState = { error?: string; fieldErrors?: Record<string, string> };
const REQ = "Majburiy maydon";

/* eslint-disable @typescript-eslint/no-explicit-any */

function fieldSchema(f: Field): z.ZodType {
  const max = f.max ?? (f.type === "richtext" ? 60000 : f.type === "textarea" ? 5000 : 300);
  switch (f.type) {
    case "checkbox": return z.boolean();
    case "gallery":
    case "files": return z.string().max(300000);
    case "number":
      return z.string().trim().transform((v, ctx) => {
        if (v === "") { if (f.required) ctx.addIssue({ code: "custom", message: REQ }); return null; }
        const n = Number(v.replace(",", "."));
        if (!Number.isFinite(n) || n < 0) { ctx.addIssue({ code: "custom", message: "To'g'ri son kiriting" }); return null; }
        return Math.round(n);
      });
    case "schedule":
      return z.string().transform((v, ctx) => {
        try {
          return z.array(z.object({ day: z.string().max(20), from: z.string().max(5), to: z.string().max(5) })).max(14).parse(JSON.parse(v || "[]"));
        } catch { ctx.addIssue({ code: "custom", message: "Jadval noto'g'ri" }); return []; }
      });
    case "image":
      return z.string().max(500).transform((v, ctx) => {
        if (!v && f.required) ctx.addIssue({ code: "custom", message: "Rasm yuklang" });
        return v || null;
      });
    case "richtext": {
      const rt = z.string().max(60000, "Matn juda uzun");
      return f.required ? rt.min(1, REQ) : rt;
    }
    default: {
      const base = z.string().trim().max(max, `Eng ko'pi bilan ${max} ta belgi`);
      return f.required
        ? base.min(1, REQ)
        : base.transform((v) => (v === "" ? null : v));
    }
  }
}

function parse(r: Resource, fd: FormData) {
  const shape: Record<string, z.ZodType> = {};
  const raw: Record<string, unknown> = {};
  for (const f of r.fields) {
    shape[f.name] = fieldSchema(f);
    raw[f.name] = f.type === "checkbox" ? fd.get(f.name) === "on" : String(fd.get(f.name) ?? "");
    if (f.type === "image" && f.thumbName) {
      shape[f.thumbName] = z.string().max(500).transform((v) => v || null);
      raw[f.thumbName] = String(fd.get(f.thumbName) ?? "");
    }
  }
  return z.object(shape).safeParse(raw);
}

export async function saveResource(slug: string, id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  const { r, db } = await guard(slug);
  const parsed = parse(r, fd);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { fieldErrors, error: "Ba'zi maydonlar noto'g'ri to'ldirilgan" };
  }
  const values = parsed.data as Record<string, unknown>;

  // Fotolavha va fayllar alohida jadvallarda saqlanadi
  const media: { f: Field; items: any[] }[] = [];
  for (const f of r.fields.filter((x) => x.type === "gallery" || x.type === "files")) {
    const m = parseMedia(f.type === "gallery" ? "images" : "files", String(values[f.name] ?? "[]"));
    delete values[f.name];
    if (!m.ok) return { error: `"${f.label}" ro'yxatida xatolik. Sahifani yangilab, qayta urinib ko'ring.` };
    media.push({ f, items: m.items });
  }
  const syncAll = async (parentId: string) => { for (const { f, items } of media) await syncChildren(db, f.child!.table, f.child!.fk, parentId, f.type === "gallery" ? "images" : "files", items); };

  if (r.singleton) {
    const { error } = await db.from(r.table).update(values).eq("id", 1);
    if (error) return { error: "Saqlab bo'lmadi: " + error.message };
    refreshPublic();
    redirect(`/admin/${r.slug}?saved=1`);
  }

  if (id) {
    const { data: old } = r.fileColumns.length ? await db.from(r.table).select(r.fileColumns.join(",")).eq("id", id).maybeSingle() : { data: null };
    const { error } = await db.from(r.table).update(values).eq("id", id);
    if (error) return { error: "Saqlab bo'lmadi. Ruxsat yo'q yoki ma'lumot noto'g'ri." };
    await syncAll(id);
    if (old) await removeStorage(r.fileColumns.filter((c) => old[c] && old[c] !== values[c]).map((c) => old[c]));
  } else {
    if (r.slugFrom) {
      const base = slugify(r.slugFrom.map((n) => String(values[n] ?? "")).join(" "));
      values.slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
    if (r.orderable) {
      const { data: last } = await db.from(r.table).select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
      values.sort_order = (last?.sort_order ?? 0) + 1;
    }
    const { data: created, error } = await db.from(r.table).insert(values).select("id").single();
    if (error || !created) return { error: "Qo'shib bo'lmadi. Ruxsat yo'q yoki ma'lumot noto'g'ri." };
    await syncAll(created.id);
  }
  refreshPublic();
  redirect(`/admin/${r.slug === "reyestr-yozuv" ? "reyestr" : r.slug}`);
}

export async function deleteResource(slug: string, id: string): Promise<{ error?: string }> {
  const { r, db } = await guard(slug);
  if (r.singleton) return { error: "Bu yozuvni o'chirib bo'lmaydi" };
  const paths: (string | null)[] = [];
  if (r.fileColumns.length) {
    const { data } = await db.from(r.table).select(r.fileColumns.join(",")).eq("id", id).maybeSingle();
    r.fileColumns.forEach((c) => paths.push(data?.[c]));
  }
  for (const ch of r.children ?? []) {
    const { data } = await db.from(ch.table).select(ch.cols.join(",")).eq(ch.fk, id);
    (data ?? []).forEach((row: any) => ch.cols.forEach((c) => paths.push(row[c])));
  }
  const { error } = await db.from(r.table).delete().eq("id", id);
  if (error) return { error: "O'chirib bo'lmadi. Ruxsat yo'q." };
  await removeStorage(paths);
  refreshPublic();
  return {};
}

export async function reorderResource(slug: string, ids: string[]): Promise<{ error?: string }> {
  const { r, db } = await guard(slug);
  if (!r.orderable) return { error: "Tartibni o'zgartirib bo'lmaydi" };
  const results = await Promise.all(ids.map((id, i) => db.from(r.table).update({ sort_order: i + 1 }).eq("id", id)));
  if (results.some((x: any) => x.error)) return { error: "Tartibni saqlab bo'lmadi" };
  refreshPublic();
  return {};
}
