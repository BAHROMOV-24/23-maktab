"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshPublic } from "@/lib/admin/helpers";

export type UserState = { error?: string; fieldErrors?: Record<string, string> };
const ROLES = ["superadmin", "admin", "maslahatchi", "koordinator"] as const;
const UUID = /^[0-9a-f-]{36}$/i;

const base = z.object({
  full_name: z.string().trim().min(2, "Ismni kiriting").max(100),
  role: z.enum(ROLES),
  council_member_id: z.string().transform((v) => v || null),
});

function errs(e: z.ZodError): UserState {
  const fieldErrors: Record<string, string> = {};
  for (const i of e.issues) fieldErrors[String(i.path[0])] ??= i.message;
  return { fieldErrors, error: "Ba'zi maydonlar noto'g'ri to'ldirilgan" };
}

export async function createUser(_prev: UserState, fd: FormData): Promise<UserState> {
  await requireRole(["superadmin"]);
  const p = base.extend({
    email: z.string().trim().toLowerCase().email("Email noto'g'ri"),
    password: z.string().min(10, "Parol kamida 10 ta belgi bo'lsin").max(100),
  }).safeParse(Object.fromEntries(["full_name", "role", "council_member_id", "email", "password"].map((k) => [k, String(fd.get(k) ?? "")])));
  if (!p.success) return errs(p.error);
  const d = p.data;
  if (d.role === "koordinator" && !d.council_member_id) return { fieldErrors: { council_member_id: "Koordinator uchun kengash a'zosini tanlang" }, error: "Kengash a'zosini tanlang" };
  if (d.council_member_id && !UUID.test(d.council_member_id)) return { error: "Noto'g'ri kengash a'zosi" };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({ email: d.email, password: d.password, email_confirm: true });
  if (error || !data.user) return { error: error?.message.includes("already") ? "Bu email allaqachon ro'yxatdan o'tgan" : "Foydalanuvchi yaratilmadi" };
  const { error: pe } = await admin.from("profiles").insert({ id: data.user.id, full_name: d.full_name, role: d.role, council_member_id: d.role === "koordinator" || d.council_member_id ? d.council_member_id : null });
  if (pe) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: pe.message.includes("council_member_id") ? "Bu kengash a'zosiga boshqa foydalanuvchi allaqachon bog'langan" : "Profil yaratilmadi" };
  }
  redirect("/admin/foydalanuvchilar");
}

export async function updateUser(id: string, _prev: UserState, fd: FormData): Promise<UserState> {
  const { user } = await requireRole(["superadmin"]);
  if (!UUID.test(id)) return { error: "Noto'g'ri identifikator" };
  const p = base.extend({ password: z.string().max(100).refine((v) => v === "" || v.length >= 10, "Parol kamida 10 ta belgi bo'lsin") })
    .safeParse(Object.fromEntries(["full_name", "role", "council_member_id", "password"].map((k) => [k, String(fd.get(k) ?? "")])));
  if (!p.success) return errs(p.error);
  const d = p.data;
  const self = id === user.id;
  const blocked = self ? false : fd.get("blocked") === "on";
  const role = self ? "superadmin" : d.role;
  if (role === "koordinator" && !d.council_member_id) return { fieldErrors: { council_member_id: "Koordinator uchun kengash a'zosini tanlang" }, error: "Kengash a'zosini tanlang" };

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ full_name: d.full_name, role, council_member_id: d.council_member_id, blocked }).eq("id", id);
  if (error) return { error: error.message.includes("council_member_id") ? "Bu kengash a'zosiga boshqa foydalanuvchi allaqachon bog'langan" : "Saqlab bo'lmadi" };
  const { error: ae } = await admin.auth.admin.updateUserById(id, { ...(d.password ? { password: d.password } : {}), ban_duration: blocked ? "876000h" : "none" });
  if (ae) return { error: "Parol yoki blok holatini yangilab bo'lmadi" };
  refreshPublic();
  redirect("/admin/foydalanuvchilar");
}

export async function deleteUser(id: string): Promise<{ error?: string }> {
  const { user } = await requireRole(["superadmin"]);
  if (!UUID.test(id) || id === user.id) return { error: "O'zingizni o'chira olmaysiz" };
  const { error } = await createAdminClient().auth.admin.deleteUser(id);
  return error ? { error: "O'chirib bo'lmadi" } : {};
}
