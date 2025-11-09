import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function RedirectPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  redirect(`/${session.user.role?.toLowerCase()}/dashboard`);
}
