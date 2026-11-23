import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { PostForm } from "@/components/admin/post-form";
import { loadPostFormData } from "@/lib/admin/post-load";

export const metadata: Metadata = { title: "Postni tahrirlash" };

export default async function EditPost({ params }: PageProps<"/admin/postlar/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const d = await loadPostFormData();
  const { data: post } = await d.db.from("posts").select("title,excerpt,body,cover_path,cover_thumb_path,status,reject_reason,author_id").eq("id", id).maybeSingle();
  if (!post) notFound();
  const [{ data: images }, { data: files }] = await Promise.all([
    d.db.from("post_images").select("path,thumb_path,alt").eq("post_id", id).order("sort_order"),
    d.db.from("post_files").select("path,name,mime,size_bytes").eq("post_id", id),
  ]);
  // Koordinator boshqa koordinatorning postini tahrirlay olmaydi
  if (!d.isStaff && post.author_id !== d.profile.council_member_id) notFound();
  return (
    <>
      <PageHeader title="Postni tahrirlash" />
      <PostForm id={id} post={post} isStaff={d.isStaff} authors={d.authors} needApproval={d.needApproval} images={images ?? []} files={files ?? []} />
    </>
  );
}
