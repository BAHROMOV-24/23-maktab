"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { removeStorage } from "@/lib/admin/storage";
import { PATH_RE } from "@/lib/upload-rules";

/* eslint-disable @typescript-eslint/no-explicit-any */
const UUID = /^[0-9a-f-]{36}$/i;
const item = z.object({ path: z.string().regex(PATH_RE).startsWith("registry/"), name: z.string().trim().min(1).max(200), mime: z.string().max(120), size_bytes: z.number().int().positive() });

export async function addRegistryFile(input: unknown): Promise<{ error?: string }> {
  const { sb } = await requireRole(["superadmin", "admin"]);
  const p = item.safeParse(input);
  if (!p.success) return { error: "Fayl ma'lumoti noto'g'ri" };
  const { error } = await (sb as any).from("registry_files").insert(p.data);
  if (error) return { error: "Saqlab bo'lmadi" };
  revalidatePath("/admin/reyestr");
  return {};
}

/** Yopiq faylni faqat 5 daqiqalik imzolangan havola orqali ochish mumkin. */
export async function getRegistryFileUrl(id: string): Promise<{ url?: string; error?: string }> {
  const { sb } = await requireRole(["superadmin", "admin"]);
  if (!UUID.test(id)) return { error: "Noto'g'ri identifikator" };
  const { data } = await (sb as any).from("registry_files").select("path").eq("id", id).maybeSingle();
  if (!data) return { error: "Fayl topilmadi" };
  const { data: signed, error } = await createAdminClient().storage.from("private").createSignedUrl(data.path, 300);
  return error || !signed ? { error: "Havolani yaratib bo'lmadi" } : { url: signed.signedUrl };
}

export async function deleteRegistryFile(id: string): Promise<{ error?: string }> {
  const { sb } = await requireRole(["superadmin", "admin"]);
  if (!UUID.test(id)) return { error: "Noto'g'ri identifikator" };
  const { data } = await (sb as any).from("registry_files").select("path").eq("id", id).maybeSingle();
  const { error, count } = await (sb as any).from("registry_files").delete({ count: "exact" }).eq("id", id);
  if (error || !count) return { error: "O'chirib bo'lmadi" };
  await removeStorage([data?.path], "private");
  revalidatePath("/admin/reyestr");
  return {};
}
