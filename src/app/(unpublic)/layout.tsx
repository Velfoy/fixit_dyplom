import { redirect } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { getCachedSession } from "@/lib/session";
import "../../styles/main_layout.css";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedSession();
  if (!session) redirect("/login");

  const role = session?.user?.role?.toLowerCase();

  return (
    <div className="main-layout">
      <Sidebar role={role} />

      <div className="content-layout">
        <header className="page-header">
          <h2>{session.user.role?.toUpperCase()} PANEL</h2>
          <form action="/api/auth/signout?callbackUrl=/" method="post">
            <button className="logout-btn">Logout</button>
          </form>
        </header>

        <main className="page-main">{children}</main>
      </div>
    </div>
  );
}
