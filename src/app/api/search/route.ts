import { NextResponse, type NextRequest } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 60).replace(/[%_\\]/g, (c) => "\\" + c);
  if (q.length < 2) return NextResponse.json([]);
  const { data } = await createPublicClient().rpc("search_site", { q });
  return NextResponse.json(data ?? [], { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
