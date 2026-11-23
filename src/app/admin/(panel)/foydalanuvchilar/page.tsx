import type { Metadata } from "next";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { deleteUser } from "@/lib/admin/user-actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { fullName } from "@/lib/format";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "Foydalanuvchilar" };

export default async function UsersPage() {
  const { user } = await requireRole(["superadmin"]);
  const admin = createAdminClient();
  const [{ data: profiles }, { data: list }, { data: council }] = await Promise.all([
    admin.from("profiles").select("*").order("created_at"),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("council_members").select("id,first_name,last_name"),
  ]);
  const email = new Map((list?.users ?? []).map((u) => [u.id, u.email]));
  const cm = new Map((council ?? []).map((c) => [c.id, fullName(c)]));
  return (
    <>
      <PageHeader title="Foydalanuvchilar" description="Ochiq ro'yxatdan o'tish o'chirilgan. Akkauntlarni faqat siz yaratasiz." addHref="/admin/foydalanuvchilar/new" addLabel="Yangi foydalanuvchi" />
      <ul className="space-y-2">
        {(profiles ?? []).map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{p.full_name || "(ismsiz)"} {p.blocked && <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-900">Bloklangan</span>}</p>
              <p className="truncate text-xs text-muted-foreground">{email.get(p.id)} · {t.roles[p.role as keyof typeof t.roles]}{p.council_member_id ? ` · ${cm.get(p.council_member_id)}` : ""}</p>
            </div>
            <Button variant="ghost" size="icon" aria-label={`Tahrirlash: ${p.full_name}`} render={<Link href={`/admin/foydalanuvchilar/${p.id}`} />}><Pencil /></Button>
            {p.id !== user.id && <DeleteButton name={p.full_name || email.get(p.id) || "foydalanuvchi"} action={deleteUser.bind(null, p.id)} />}
          </li>
        ))}
      </ul>
    </>
  );
}
