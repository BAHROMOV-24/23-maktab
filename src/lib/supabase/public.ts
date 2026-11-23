import { createClient } from "@supabase/supabase-js";

/**
 * Cookie'siz anonim klient: ommaviy (ISR/keshlanadigan) sahifalar uchun.
 * Faqat RLS ruxsat bergan (e'lon qilingan) ma'lumotni o'qiydi.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
