import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  if (
    pathname.startsWith("/user") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/products")
  ) {
    if (!token || !role) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/home"; // or "/"
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/profile/:path*", "/products", "/products/:path*"],
};
