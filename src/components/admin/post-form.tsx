"use client";

import { useState } from "react";
import { useFormSubmit } from "@/lib/use-form-submit";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { savePost } from "@/lib/admin/post-actions";
import type { FormState } from "@/lib/admin/actions";
import { t } from "@/lib/i18n";
import { FilesField } from "./files-field";
import { GalleryField } from "./gallery-field";
import { ImageField } from "./image-field";
import { RichTextEditor } from "./rich-text-editor";

type Post = { title: string; excerpt: string | null; body: string; cover_path: string | null; cover_thumb_path: string | null; status: string; reject_reason: string | null; author_id: string };

export function PostForm({ id, post, isStaff, authors, needApproval, images = [], files = [] }: {
  id: string | null; post: Post | null; isStaff: boolean; authors: { value: string; label: string }[]; needApproval: boolean;
  images?: { path: string; thumb_path: string | null; alt: string | null }[]; files?: { path: string; name: string; mime: string | null; size_bytes: number | null }[];
}) {
  const { state, pending, onSubmit } = useFormSubmit<FormState>(savePost.bind(null, id), {});
  const [rejecting, setRejecting] = useState(false);
  const fe = state.fieldErrors ?? {};
  const status = post?.status ?? "draft";
  const mineLocked = !isStaff && status === "published";

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-xl border bg-card p-5 shadow-sm sm:p-6" noValidate>
      {status === "rejected" && post?.reject_reason && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm"><b>Post rad etilgan.</b> Sabab: {post.reject_reason}</p>
      )}
      {status === "review" && !isStaff && <p className="rounded-lg bg-amber-100 p-3 text-sm text-amber-900">Post tekshiruvda. Maslahatchi tasdiqlagach saytda chiqadi.</p>}
      {mineLocked && needApproval && <p className="rounded-lg bg-amber-100 p-3 text-sm text-amber-900">Post e&apos;lon qilingan. Tahrirlasangiz, qayta tekshiruvga yuboriladi.</p>}

      {isStaff && (
        <div className="space-y-1.5">
          <Label htmlFor="author_id">Muallif (koordinator)</Label>
          <select id="author_id" name="author_id" defaultValue={post?.author_id ?? ""} required className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
            <option value="" disabled>— tanlang —</option>
            {authors.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="title">Sarlavha <span className="text-destructive">*</span></Label>
        <Input id="title" name="title" defaultValue={post?.title ?? ""} aria-invalid={!!fe.title} />
        {fe.title && <p className="text-sm text-destructive">{fe.title}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="excerpt">Qisqa tavsif</Label>
        <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={post?.excerpt ?? ""} placeholder="Ro'yxatda ko'rinadigan 1–2 jumla" />
      </div>
      <div className="space-y-1.5"><Label>Matn</Label><RichTextEditor name="body" defaultValue={post?.body ?? ""} invalid={!!fe.body} /></div>
      <div className="space-y-1.5"><Label>Asosiy rasm</Label>
        <ImageField name="cover_path" thumbName="cover_thumb_path" label="Asosiy rasm" folder="posts" defaultPath={post?.cover_path} defaultThumb={post?.cover_thumb_path} /></div>
      <div className="space-y-1.5"><Label>Fotolavhalar (galereya)</Label><GalleryField name="gallery" folder="posts" defaultItems={images} /></div>
      <div className="space-y-1.5"><Label>Biriktirilgan fayllar</Label><FilesField name="attachments" folder="posts" defaultItems={files} /></div>

      {rejecting && (
        <div className="space-y-1.5 rounded-lg border border-destructive/40 p-3">
          <Label htmlFor="reject_reason">Rad etish sababi</Label>
          <Textarea id="reject_reason" name="reject_reason" rows={2} aria-invalid={!!fe.reject_reason} placeholder="Muallif nimani tuzatishi kerak?" />
          <Button type="submit" name="intent" value="reject" variant="destructive" disabled={pending}>Rad etishni tasdiqlash</Button>
        </div>
      )}
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}

      <div className="sticky bottom-0 -mx-5 -mb-5 flex flex-wrap gap-2 rounded-b-xl border-t bg-card/95 p-4 backdrop-blur sm:-mx-6 sm:-mb-6">
        {mineLocked ? (
          <Button type="submit" name="intent" value="keep" disabled={pending}>Saqlash</Button>
        ) : isStaff ? (
          <>
            <Button type="submit" name="intent" value="publish" disabled={pending}>{status === "published" ? "Saqlash" : "E'lon qilish"}</Button>
            {status !== "published" && <Button type="submit" name="intent" value="draft" variant="outline" disabled={pending}>Qoralama</Button>}
            {status === "published" && <Button type="submit" name="intent" value="unpublish" variant="outline" disabled={pending}>Qoralamaga qaytarish</Button>}
            {status === "review" && !rejecting && <Button type="button" variant="destructive" onClick={() => setRejecting(true)}>Rad etish</Button>}
          </>
        ) : (
          <>
            <Button type="submit" name="intent" value="review" disabled={pending}>{needApproval ? "Tekshiruvga yuborish" : "E'lon qilish"}</Button>
            <Button type="submit" name="intent" value="draft" variant="outline" disabled={pending}>Qoralama sifatida saqlash</Button>
          </>
        )}
        <Button type="button" variant="ghost" render={<Link href="/admin/postlar" />}>Bekor qilish</Button>
        <span className="ml-auto self-center text-xs text-muted-foreground">Holati: {t.status[status as keyof typeof t.status]}</span>
      </div>
    </form>
  );
}
