import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** public-media bucketidan fayllarni o'chiradi (keraksiz fayllar to'planib qolmasin). */
export async function removeStorage(paths: (string | null | undefined)[], bucket = "public-media") {
  const list = [...new Set(paths.filter((p): p is string => !!p && !/^https?:\/\//.test(p) && !p.startsWith("/")))];
  if (list.length === 0) return;
  await createAdminClient().storage.from(bucket).remove(list);
}
