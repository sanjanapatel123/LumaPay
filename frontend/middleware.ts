import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("wallet_session")?.value;
  const secret = process.env.JWT_SECRET;
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/login";

  let isAuthenticated = false;

  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated && !isLoginPage) {
    const response = NextResponse.redirect(new URL("/login", request.url));

    if (token) {
      response.cookies.delete("wallet_session");
    }

    return response;
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/wallet/:path*", "/transactions/:path*", "/login"],
};
