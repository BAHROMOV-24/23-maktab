"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { inquirySchema } from "@/lib/validators/inquiry";
import { t } from "@/lib/i18n";

export type InquiryState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

export async function submitInquiry(_prev: InquiryState, fd: FormData): Promise<InquiryState> {
  // Honeypot: oddiy foydalanuvchi bu maydonni ko'rmaydi
  if (String(fd.get("website") ?? "").trim() !== "") return { ok: true };

  const parsed = inquirySchema.safeParse({
    name: fd.get("name"), phone: fd.get("phone"), subject: fd.get("subject"), message: fd.get("message"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { fieldErrors };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const sb = createAdminClient();
  const { data: allowed } = await sb.rpc("rate_limit_hit", { p_key: `inquiry:${ip}`, p_max: 3, p_window: 3600 });
  if (allowed === false) return { error: t.inquiry.tooMany };

  const { error } = await sb.from("inquiries").insert(parsed.data);
  if (error) return { error: "Yuborishda xatolik yuz berdi. Keyinroq qayta urinib ko'ring." };
  return { ok: true };
}
