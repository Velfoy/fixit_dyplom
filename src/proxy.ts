import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Not logged in → redirect to login
    if (!token?.role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Logged in → continue
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/client/:path*",
    "/mechanik/:path*",
    "/warehouse/:path*",
    "/shared/:path*",
  ],
};
