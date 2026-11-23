import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { PostForm } from "@/components/admin/post-form";
import { loadPostFormData } from "@/lib/admin/post-load";

export const metadata: Metadata = { title: "Yangi post" };

export default async function NewPost() {
  const d = await loadPostFormData();
  return (
    <>
      <PageHeader title="Yangi post" />
      {!d.isStaff && !d.profile.council_member_id && <p role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">Akkauntingiz kengash a&apos;zosiga bog&apos;lanmagan, shuning uchun post yoza olmaysiz. Administratorga murojaat qiling.</p>}
      <PostForm id={null} post={null} isStaff={d.isStaff} authors={d.authors} needApproval={d.needApproval} />
    </>
  );
}
