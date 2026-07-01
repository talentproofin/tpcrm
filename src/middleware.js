import { NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/services/supabase/middleware";
import { AUTH_ROUTES } from "@/features/auth/constants/routes";

const AUTH_PATHS = new Set([
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.ACCESS_PENDING,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
]);

/**
 * @param {string} pathname
 */
function isAuthPath(pathname) {
  return AUTH_PATHS.has(pathname);
}

/**
 * @param {import("next/server").NextRequest} request
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request });

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp)$/.test(pathname)
  ) {
    return response;
  }

  const supabase = createMiddlewareSupabaseClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isAuthPath(pathname) && pathname !== "/") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = AUTH_ROUTES.LOGIN;
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthPath(pathname)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = AUTH_ROUTES.DASHBOARD;
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  if (user && pathname === "/") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = AUTH_ROUTES.DASHBOARD;
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
