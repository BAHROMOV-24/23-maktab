import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/sidebar";
import { requireRole } from "@/lib/auth";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: { default: "Admin panel", template: "%s | Admin" }, robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const { profile } = await requireRole();
  const items = ADMIN_NAV.filter((i) => i.roles.includes(profile.role));
  return (
    <AdminShell items={items} name={profile.full_name || "Foydalanuvchi"} roleLabel={t.roles[profile.role]}>
      {children}
    </AdminShell>
  );
}
