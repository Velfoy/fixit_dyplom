import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = session?.user?.role?.toLowerCase();

  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar role={role}></Sidebar>
      <header className="bg-gray-900 text-white p-4 flex justify-between">
        <h2>{session.user.role?.toUpperCase()} PANEL</h2>
        <form action="/api/auth/signout?callbackUrl=/" method="post">
          <button className="bg-red-600 px-3 py-1 rounded">Logout</button>
        </form>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
