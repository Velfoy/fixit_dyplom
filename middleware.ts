import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isRouteAllowed } from "@/lib/routeAccess";

/**
 * Route access matrix: defines which pages each role can access
 */
const routeAccessMatrix: Record<string, string[]> = {
  admin: [
    "dashboard",
    "customers",
    "users",
    "mechanics",
    "warehouse",
    "orders",
    "cars",
    "invoices",
    "info",
    "settings",
    "profile",
  ],
  mechanic: [
    "dashboard",
    "warehouse",
    "orders",
    "invoices",
    "info",
    "settings",
    "profile",
  ],
  client: [
    "dashboard",
    "orders",
    "cars",
    "history",
    "invoices",
    "info",
    "settings",
    "profile",
  ],
  warehouse: [
    "dashboard",
    "orders",
    "warehouse",
    "invoices",
    "info",
    "settings",
    "profile",
  ],
};

/**
 * Middleware:
 * 1. Sets lightweight user info headers (role, id, name, email) from NextAuth token
 * 2. Protects role-based routes: redirects if URL role param doesn't match user role
 * 3. Protects route access: redirects if user tries to access a page not allowed for their role
 */
export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userRole = (token as any)?.role?.toLowerCase();

    // copy existing request headers and add our lightweight user headers
    const newHeaders = new Headers(req.headers as any);
    if (token) {
      const anyToken = token as any;
      if (anyToken.role) newHeaders.set("x-user-role", String(anyToken.role));
      const uid = anyToken.id ?? anyToken.sub;
      if (uid) newHeaders.set("x-user-id", String(uid));
      if (anyToken.name) newHeaders.set("x-user-name", String(anyToken.name));
      if (anyToken.email)
        newHeaders.set("x-user-email", String(anyToken.email));
    }

    const pathname = req.nextUrl.pathname;

    // Split path into segments and determine role and all requested pages
    // Examples:
    //  /client/dashboard      -> segments = ["client","dashboard"]
    //  /admin/warehouse/info  -> segments = ["admin","warehouse","info"]
    //  /unpublic/client/info  -> segments = ["unpublic","client","info"]
    const segments = pathname.split("/").filter(Boolean);
    let roleInUrl: string | null = null;
    let pageSegments: string[] = [];

    // Detect if first segment is a valid role
    const validRoles = Object.keys(routeAccessMatrix);
    if (segments.length > 0) {
      if (
        segments[0] === "unpublic" &&
        segments[1] &&
        validRoles.includes(segments[1].toLowerCase())
      ) {
        roleInUrl = segments[1].toLowerCase();
        pageSegments = segments.slice(2).map((s) => s.toLowerCase());
      } else if (validRoles.includes(segments[0].toLowerCase())) {
        roleInUrl = segments[0].toLowerCase();
        pageSegments = segments.slice(1).map((s) => s.toLowerCase());
      } else {
        // If first segment is not a valid role, treat as public or invalid route
        roleInUrl = null;
        pageSegments = segments.map((s) => s.toLowerCase());
      }
    }

    if (roleInUrl && validRoles.includes(roleInUrl)) {
      if (!userRole) {
        // user not authenticated but trying to access role area -> send to login
        const loginUrl = new URL(`/login`, req.nextUrl.origin);
        return NextResponse.redirect(loginUrl);
      }

      // if user tries to access a different role's route, redirect to their role
      if (roleInUrl !== userRole) {
        // Always redirect to dashboard, never to /{userRole} or /CLIENT
        const redirectUrl = new URL(
          `/${userRole}/dashboard`,
          req.nextUrl.origin
        );
        return NextResponse.redirect(redirectUrl);
      }

      // check all page segments for access
      for (const seg of pageSegments) {
        if (!isRouteAllowed(userRole, seg)) {
          const redirectUrl = new URL(
            `/${userRole}/dashboard`,
            req.nextUrl.origin
          );
          return NextResponse.redirect(redirectUrl);
        }
      }
    }

    return NextResponse.next({ request: { headers: newHeaders } });
  } catch (err) {
    // don't break request on middleware failure
    return NextResponse.next();
  }
}

export const config = {
  // run middleware for all app routes (exclude _next assets and static)
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
