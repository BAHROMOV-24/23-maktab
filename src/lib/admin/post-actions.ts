"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { COUNCIL_STAFF, requireRole } from "@/lib/auth";
import { refreshPublic } from "@/lib/admin/helpers";
import { removeStorage } from "@/lib/admin/storage";
import { parseMedia, syncChildren } from "@/lib/admin/media-sync";
import { slugify } from "@/lib/format";
import type { FormState } from "@/lib/admin/actions";

/* eslint-disable @typescript-eslint/no-explicit-any */
const schema = z.object({
  title: z.string().trim().min(3, "Sarlavha kamida 3 ta belgi bo'lsin").max(200),
  excerpt: z.string().trim().max(400).transform((v) => v || null),
  body: z.string().max(60000),
  cover_path: z.string().max(500).transform((v) => v || null),
  cover_thumb_path: z.string().max(500).transform((v) => v || null),
});
const UUID = /^[0-9a-f-]{36}$/i;

export async function savePost(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  const { profile, sb } = await requireRole();
  const db = sb as any;
  const isStaff = COUNCIL_STAFF.includes(profile.role);
  const intent = String(fd.get("intent") ?? "draft");

  const parsed = schema.safeParse(Object.fromEntries(["title", "excerpt", "body", "cover_path", "cover_thumb_path"].map((k) => [k, String(fd.get(k) ?? "")])));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { fieldErrors, error: "Ba'zi maydonlar noto'g'ri to'ldirilgan" };
  }

  const gal = parseMedia("images", String(fd.get("gallery") ?? "[]"));
  const att = parseMedia("files", String(fd.get("attachments") ?? "[]"));
  if (!gal.ok || !att.ok) return { error: "Rasm yoki fayllar ro'yxatida xatolik. Sahifani yangilab, qayta urinib ko'ring." };

  const authorId = isStaff ? String(fd.get("author_id") ?? "") : profile.council_member_id;
  if (!authorId || !UUID.test(authorId)) return { error: isStaff ? "Muallifni tanlang" : "Sizning akkauntingiz kengash a'zosiga bog'lanmagan. Administratorga murojaat qiling." };

  const { data: settings } = await db.from("site_settings").select("require_approval").eq("id", 1).single();
  const needApproval = settings?.require_approval !== false;

  let existing: any = null;
  if (id) {
    const { data } = await db.from("posts").select("id,status,author_id").eq("id", id).maybeSingle();
    existing = data;
    if (!existing) return { error: "Post topilmadi yoki unga ruxsatingiz yo'q" };
    if (!isStaff && existing.author_id !== profile.council_member_id) return { error: "Bu post sizga tegishli emas" };
  }

  // Holatni rolga qarab aniqlaymiz (DB triggeri ham qayta tekshiradi)
  let status: string;
  let reason: string | null = null;
  switch (intent) {
    case "keep": status = existing?.status ?? "draft"; break;
    case "draft": status = existing?.status === "published" && !isStaff ? "published" : "draft"; break;
    case "review": status = !isStaff && !needApproval ? "published" : "review"; break;
    case "publish":
      if (!isStaff && needApproval) return { error: "Postni e'lon qilish uchun maslahatchi tasdig'i kerak. «Tekshiruvga yuborish» tugmasidan foydalaning." };
      status = "published"; break;
    case "unpublish":
      if (!isStaff) return { error: "Ruxsat yo'q" };
      status = "draft"; break;
    case "reject":
      if (!isStaff) return { error: "Ruxsat yo'q" };
      reason = String(fd.get("reject_reason") ?? "").trim().slice(0, 500);
      if (!reason) return { error: "Rad etish sababini yozing", fieldErrors: { reject_reason: "Sababni yozing" } };
      status = "rejected"; break;
    default: return { error: "Noma'lum amal" };
  }
  if (existing?.status === "published" && !isStaff) status = "published"; // trigger kerak bo'lsa 'review'ga o'tkazadi

  const values: Record<string, unknown> = { ...parsed.data, author_id: authorId, status };
  if (status === "rejected") values.reject_reason = reason;

  let postId = id;
  if (existing) {
    const { data: old } = await db.from("posts").select("cover_path,cover_thumb_path").eq("id", id).single();
    const { error } = await db.from("posts").update(values).eq("id", id);
    if (error) return { error: "Saqlab bo'lmadi: " + error.message.replace(/^.*?:\s*/, "") };
    const stale = ["cover_path", "cover_thumb_path"].filter((c) => old?.[c] && old[c] !== values[c]).map((c) => old[c]);
    await removeStorage(stale);
  } else {
    values.slug = `${slugify(parsed.data.title)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data: created, error } = await db.from("posts").insert(values).select("id").single();
    if (error || !created) return { error: "Saqlab bo'lmadi: " + (error?.message ?? "").replace(/^.*?:\s*/, "") };
    postId = created.id;
  }
  await syncChildren(db, "post_images", "post_id", postId!, "images", gal.items);
  await syncChildren(db, "post_files", "post_id", postId!, "files", att.items);
  refreshPublic();
  redirect("/admin/postlar");
}

export async function deletePost(id: string): Promise<{ error?: string }> {
  const { sb } = await requireRole();
  const db = sb as any;
  if (!UUID.test(id)) return { error: "Noto'g'ri identifikator" };
  const [{ data: post }, { data: imgs }, { data: files }] = await Promise.all([
    db.from("posts").select("cover_path,cover_thumb_path").eq("id", id).maybeSingle(),
    db.from("post_images").select("path,thumb_path").eq("post_id", id),
    db.from("post_files").select("path").eq("post_id", id),
  ]);
  const { error, count } = await db.from("posts").delete({ count: "exact" }).eq("id", id);
  if (error || !count) return { error: "O'chirib bo'lmadi. Ruxsat yo'q (koordinator faqat qoralama yoki rad etilgan postni o'chira oladi)." };
  await removeStorage([post?.cover_path, post?.cover_thumb_path, ...(imgs ?? []).flatMap((i: any) => [i.path, i.thumb_path]), ...(files ?? []).map((f: any) => f.path)]);
  refreshPublic();
  return {};
}
