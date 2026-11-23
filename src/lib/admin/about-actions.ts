"use server";

import { z } from "zod";
import { guard, refreshPublic } from "@/lib/admin/helpers";

export type AboutState = { ok?: boolean; error?: string };
const schema = z.object({ body: z.string().max(60000), title: z.string().trim().min(1).max(120) });

export async function saveAbout(_prev: AboutState, fd: FormData): Promise<AboutState> {
  const { db } = await guard("sozlamalar");
  for (const key of ["tarix", "maqsad", "yutuqlar"]) {
    const p = schema.safeParse({ title: fd.get(`${key}_title`), body: fd.get(`${key}_body`) });
    if (!p.success) return { error: "Sarlavha bo'sh bo'lmasin yoki matn juda uzun" };
    const { error } = await db.from("about_sections").upsert({ key, ...p.data });
    if (error) return { error: "Saqlab bo'lmadi" };
  }
  refreshPublic();
  return { ok: true };
}
