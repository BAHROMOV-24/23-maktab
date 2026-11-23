"use server";

import { requireRole } from "@/lib/auth";

/* eslint-disable @typescript-eslint/no-explicit-any */
const STATUSES = ["yangi", "korib_chiqilmoqda", "javob_berildi"];

export async function setInquiryStatus(id: string, status: string): Promise<{ error?: string }> {
  const { sb } = await requireRole(["superadmin", "admin"]);
  if (!STATUSES.includes(status) || !/^[0-9a-f-]{36}$/i.test(id)) return { error: "Noto'g'ri qiymat" };
  const { error } = await (sb as any).from("inquiries").update({ status }).eq("id", id);
  return error ? { error: "Saqlab bo'lmadi" } : {};
}

export async function deleteInquiry(id: string): Promise<{ error?: string }> {
  const { sb } = await requireRole(["superadmin", "admin"]);
  const { error, count } = await (sb as any).from("inquiries").delete({ count: "exact" }).eq("id", id);
  return error || !count ? { error: "O'chirib bo'lmadi" } : {};
}
