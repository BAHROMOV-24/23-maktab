import "server-only";
import { z } from "zod";
import { PATH_RE } from "@/lib/upload-rules";
import { removeStorage } from "@/lib/admin/storage";

/* eslint-disable @typescript-eslint/no-explicit-any */
const pubPath = z.string().regex(PATH_RE).refine((p) => !p.startsWith("registry/"), "Noto'g'ri yo'l");
const imageItem = z.object({ path: pubPath, thumb_path: pubPath.nullable().optional().transform((v) => v ?? null), alt: z.string().max(150).nullable().optional().transform((v) => v ?? null) });
const fileItem = z.object({ path: pubPath, name: z.string().trim().min(1).max(200), mime: z.string().max(120).nullable().optional().transform((v) => v ?? null), size_bytes: z.number().int().nonnegative().nullable().optional().transform((v) => v ?? null) });

export type ImageItem = z.infer<typeof imageItem>;
export type FileItemT = z.infer<typeof fileItem>;

export function parseMedia(kind: "images" | "files", json: string) {
  try {
    const schema = z.array(kind === "images" ? imageItem : fileItem).max(60);
    const r = schema.safeParse(JSON.parse(json || "[]"));
    return r.success ? { ok: true as const, items: r.data as any[] } : { ok: false as const };
  } catch {
    return { ok: false as const };
  }
}

/** Bolalar jadvalini (rasmlar yoki fayllar) yangi ro'yxatga moslaydi; olib tashlanganlarning fayllari Storage'dan o'chadi. */
export async function syncChildren(db: any, table: string, fk: string, parentId: string, kind: "images" | "files", items: any[]) {
  const cols = kind === "images" ? "id,path,thumb_path" : "id,path";
  const { data } = await db.from(table).select(cols).eq(fk, parentId);
  const existing: any[] = data ?? [];
  const keep = new Set(items.map((i) => i.path));
  const gone = existing.filter((e) => !keep.has(e.path));
  if (gone.length) {
    await db.from(table).delete().in("id", gone.map((g) => g.id));
    await removeStorage(gone.flatMap((g) => [g.path, g.thumb_path]));
  }
  const have = new Map(existing.map((e) => [e.path, e.id]));
  const fresh = items.map((it, i) => ({ ...it, [fk]: parentId, ...(kind === "images" ? { sort_order: i } : {}) })).filter((it) => !have.has(it.path));
  if (fresh.length) await db.from(table).insert(fresh);
  if (kind === "images") {
    await Promise.all(items.map((it, i) => (have.has(it.path) ? db.from(table).update({ sort_order: i, alt: it.alt }).eq("id", have.get(it.path)) : null)));
  }
}
