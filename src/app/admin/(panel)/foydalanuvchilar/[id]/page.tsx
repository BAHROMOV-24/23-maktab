import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { UserForm } from "@/components/admin/user-form";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { fullName } from "@/lib/format";

export const metadata: Metadata = { title: "Foydalanuvchini tahrirlash" };

export default async function EditUser({ params }: PageProps<"/admin/foydalanuvchilar/[id]">) {
  const { user } = await requireRole(["superadmin"]);
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const admin = createAdminClient();
  const [{ data: profile }, { data: au }, { data: council }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", id).maybeSingle(),
    admin.auth.admin.getUserById(id),
    admin.from("council_members").select("id,first_name,last_name,role").order("sort_order"),
  ]);
  if (!profile) notFound();
  return (
    <>
      <PageHeader title="Foydalanuvchini tahrirlash" />
      <UserForm isSelf={id === user.id} user={{ ...profile, email: au.user?.email }} council={(council ?? []).map((c) => ({ value: c.id, label: `${fullName(c)} (${c.role})` }))} />
    </>
  );
}
