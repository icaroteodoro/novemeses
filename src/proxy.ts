import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Define protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/modules");

  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect from login to dashboard if already logged in
  if (request.nextUrl.pathname === "/login" && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/modules/:path*",
    "/login",
  ],
};
