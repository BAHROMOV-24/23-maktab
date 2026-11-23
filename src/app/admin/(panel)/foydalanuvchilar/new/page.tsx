import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { UserForm } from "@/components/admin/user-form";
import { requireRole } from "@/lib/auth";
import { fullName } from "@/lib/format";

export const metadata: Metadata = { title: "Yangi foydalanuvchi" };

export default async function NewUser() {
  const { sb } = await requireRole(["superadmin"]);
  const { data } = await sb.from("council_members").select("id,first_name,last_name,role").order("sort_order");
  return (
    <>
      <PageHeader title="Yangi foydalanuvchi" description="Koordinator uchun akkaunt yaratayotgan bo'lsangiz, uni kengashdagi o'z yozuviga bog'lang." />
      <UserForm user={null} council={(data ?? []).map((c) => ({ value: c.id, label: `${fullName(c)} (${c.role})` }))} />
    </>
  );
}
