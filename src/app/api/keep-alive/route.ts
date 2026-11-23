import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // sir o'rnatilmagan bo'lsa endpoint yopiq
  const given = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(given), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Supabase bepul tarifi 7 kun faol bo'lmasa loyihani to'xtatadi.
 * Vercel Cron har kuni shu manzilni chaqiradi (vercel.json) va bazaga kichik so'rov yuboradi.
 * Shu bilan birga eskirgan rate-limit yozuvlarini tozalaydi.
 */
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  const sb = createAdminClient();
  const { error } = await sb.from("site_settings").select("id").eq("id", 1).single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const cutoff = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await sb.from("rate_limits").delete({ count: "exact" }).lt("window_start", cutoff);
  return NextResponse.json({ ok: true, at: new Date().toISOString(), cleaned: count ?? 0 }, { headers: { "Cache-Control": "no-store" } });
}
