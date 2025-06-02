import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isTokenExpired } from "./lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const expired = token ? isTokenExpired(token) : true;

  // const protectedPaths = ["/dashboard"];

  // const isProtectedRoute = protectedPaths.some((path) => pathname.startsWith(path));

  // if (pathname === "/sign-in" && token && !expired) {
  //   return NextResponse.redirect(new URL("/dashboard/properties/master-development", req.url));
  // }

  // if (isProtectedRoute && (!token || expired)) {
  //   return NextResponse.redirect(new URL("/sign-in", req.url));
  // }

  // Otherwise, continue
  return NextResponse.next();
}
