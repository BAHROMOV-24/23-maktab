import "server-only";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getResource } from "@/lib/admin/resources";

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Resurs mavjudligi va foydalanuvchi roli tekshiriladi (har bir action'da). */
export async function guard(slug: string) {
  const r = getResource(slug);
  if (!r) notFound();
  const s = await requireRole(r.roles);
  return { r, s, db: s.sb as any };
}

/** Admin paneldan o'zgarish kiritilganda ommaviy sahifalar darhol yangilanadi. */
export function refreshPublic() {
  revalidatePath("/", "layout");
}
