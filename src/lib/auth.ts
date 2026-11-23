import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type Role = Database["public"]["Enums"]["user_role"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** Joriy foydalanuvchi + profil (bloklangan yoki profilsiz bo'lsa null). */
export const getSession = cache(async () => {
  const sb = await createClient();
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await sb.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
  if (!profile || profile.blocked) return null;
  return { user: data.user, profile: profile as Profile, sb };
});

/** Server sahifa va action'larda rolni QAYTA tekshiradi (proxy'ga ishonmaymiz). */
export async function requireRole(roles?: Role[]) {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (roles && !roles.includes(s.profile.role)) redirect("/admin?denied=1");
  return s;
}

export const ADMINS: Role[] = ["superadmin", "admin"];
export const COUNCIL_STAFF: Role[] = ["superadmin", "admin", "maslahatchi"];
export const ALL_ROLES: Role[] = ["superadmin", "admin", "maslahatchi", "koordinator"];
