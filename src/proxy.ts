import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

/**
 * /admin yo'llarini himoyalaydi (kirmagan foydalanuvchi login'ga yo'naltiriladi).
 * Rol va blok holati server sahifa va action'larda qayta tekshiriladi.
 */
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  if (!user && pathname !== "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
