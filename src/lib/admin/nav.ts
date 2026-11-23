import type { Role } from "@/lib/auth";

export type AdminNavItem = { href: string; label: string; roles: Role[]; icon: string };
const A: Role[] = ["superadmin", "admin"];
const S: Role[] = ["superadmin", "admin", "maslahatchi"];
const ALL: Role[] = ["superadmin", "admin", "maslahatchi", "koordinator"];

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Boshqaruv paneli", roles: ALL, icon: "layout" },
  { href: "/admin/postlar", label: "Postlar", roles: ALL, icon: "file" },
  { href: "/admin/kengash", label: "Kengash a'zolari", roles: S, icon: "users" },
  { href: "/admin/rahbarlar", label: "Rahbarlar", roles: A, icon: "user" },
  { href: "/admin/oqituvchilar", label: "O'qituvchilar", roles: A, icon: "grad" },
  { href: "/admin/tadbirlar", label: "Tadbirlar", roles: A, icon: "cal" },
  { href: "/admin/elonlar", label: "E'lonlar", roles: A, icon: "bell" },
  { href: "/admin/togaraklar", label: "To'garaklar", roles: A, icon: "puzzle" },
  { href: "/admin/reyestr", label: "Reyestr", roles: A, icon: "lock" },
  { href: "/admin/murojaatlar", label: "Murojaatlar", roles: A, icon: "mail" },
  { href: "/admin/slayderlar", label: "Bosh sahifa slayderi", roles: A, icon: "image" },
  { href: "/admin/hamkorlar", label: "Hamkorlar", roles: A, icon: "handshake" },
  { href: "/admin/galereya", label: "Fotogalereya", roles: A, icon: "image" },
  { href: "/admin/sozlamalar", label: "Sayt sozlamalari", roles: A, icon: "settings" },
  { href: "/admin/foydalanuvchilar", label: "Foydalanuvchilar", roles: ["superadmin"], icon: "shield" },
];
