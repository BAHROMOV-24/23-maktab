import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Service role klienti. FAQAT serverda. RLS'ni chetlab o'tadi, ehtiyot bo'ling. */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
