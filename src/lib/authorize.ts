import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Call this at the top of a server component/page
 * Example: await authorizePage(["admin", "mechanik"])
 */
export async function authorizePage(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role?.toLowerCase();

  if (!session) redirect("/login");

  // Normalize allowed roles to lowercase too
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

  if (!userRole || !normalizedAllowed.includes(userRole)) {
    redirect(`/${userRole || "client"}/dashboard`);
  }

  return session;
}
