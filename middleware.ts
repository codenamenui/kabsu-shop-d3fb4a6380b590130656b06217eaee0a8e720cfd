import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;

  const supabase = createMiddlewareClient({ req, res: NextResponse.next() });

  // Verify the user session with Supabase
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Check for admin pages
  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user?.id)
    .single();

  if (admin) {
    return NextResponse.next();
  }

  // Allow requests to root without restriction
  if (pathname === "/" || pathname.startsWith("/FAQ")) {
    return NextResponse.next();
  }

  // Unauthorized access (no user)
  if (
    !user &&
    (pathname.startsWith("/account") || pathname.startsWith("/cart"))
  ) {
    url.pathname = "/";
    url.searchParams.set("redirectReason", "unauthorized");
    url.searchParams.set("timestamp", Date.now().toString());
    return NextResponse.redirect(url);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Merchandise not ready
  if (pathname.startsWith("/merch")) {
    const merchId = pathname.split("/")[2];
    const { data: merch } = await supabase
      .from("merchandises")
      .select("ready")
      .eq("id", merchId)
      .single();

    if (!merch?.ready) {
      url.pathname = "/";
      url.searchParams.set("redirectReason", "merch_not_ready");
      url.searchParams.set("timestamp", Date.now().toString());
      return NextResponse.redirect(url);
    }
  }

  // Admin page access
  if (pathname.startsWith("/admin")) {
    if (!admin) {
      url.pathname = "/";
      url.searchParams.set("redirectReason", "admin_access_denied");
      url.searchParams.set("timestamp", Date.now().toString());
      return NextResponse.redirect(url);
    }
  }

  // Shop management access
  if (pathname.startsWith("/manage-shop")) {
    const shopId = pathname.split("/")[2];

    const { data: officer } = await supabase
      .from("officers")
      .select("*")
      .eq("user_id", user.id)
      .eq("shop_id", shopId)
      .single();

    if (!officer) {
      url.pathname = "/";
      url.searchParams.set("redirectReason", "shop_management_denied");
      url.searchParams.set("timestamp", Date.now().toString());
      return NextResponse.redirect(url);
    }
  }

  // Allow the request if all checks pass
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/manage-shop/:path*",
    "/cart/:path*",
    "/account/:path*",
    "/merch/:path*",
    "/search/:path*",
    "/shop/:path*",
  ],
};
