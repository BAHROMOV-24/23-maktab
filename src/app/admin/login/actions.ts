"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type LoginState = { error?: string };
const schema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) });

export async function login(next: string, _prev: LoginState, fd: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { error: "Email va parolni to'g'ri kiriting" };
  const { email, password } = parsed.data;

  // Qayta-qayta urinishlarga cheklov: IP bo'yicha 15 daqiqada 10 ta, email bo'yicha 5 ta
  const ip = ((await headers()).get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const admin = createAdminClient();
  const [a, b] = await Promise.all([
    admin.rpc("rate_limit_hit", { p_key: `login-ip:${ip}`, p_max: 10, p_window: 900 }),
    admin.rpc("rate_limit_hit", { p_key: `login-email:${email}`, p_max: 5, p_window: 900 }),
  ]);
  if (a.data === false || b.data === false) return { error: "Juda ko'p urinish. 15 daqiqadan keyin qayta urinib ko'ring." };

  const sb = await createClient();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Email yoki parol noto'g'ri" };

  const { data: profile } = await sb.from("profiles").select("blocked").eq("id", data.user.id).maybeSingle();
  if (!profile || profile.blocked) {
    await sb.auth.signOut();
    return { error: "Bu akkaunt faol emas. Administrator bilan bog'laning." };
  }
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/admin/login");
}
