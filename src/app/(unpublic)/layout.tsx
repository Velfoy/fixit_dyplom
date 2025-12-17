import { redirect } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import SearchBar from "@/components/layouts/SearchBar";
import { getCachedSession } from "@/lib/session";
import "../../styles/main_layout.css";
import { User } from "lucide-react";
import useFormattedDate from "@/hooks/useData";
export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedSession();
  if (!session) redirect("/login");

  const role = session?.user?.role?.toLowerCase();
  const fullName = session?.user?.name || "User";
  const firstName = fullName.split(" ")[0];

  const userName = firstName || "User";

  return (
    <div className="main-layout">
      <Sidebar role={role} />

      <div className="content-layout">
        <div className="topbar">
          <SearchBar />

          <div className="right-section">
            <div className="user-box">
              <div className="status-dot"></div>
              <div className="avatar">
                <User className="avatar-icon" />
              </div>
              <div className="user-info">
                <div className="username">Hello, {userName}</div>
              </div>
              <span className="date">{useFormattedDate()}</span>
              <form
                className="form_logout"
                action="/api/auth/signout?callbackUrl=/"
                method="post"
              >
                <button className="logout-btn">
                  <span>Logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        <main className="page-main">{children}</main>
      </div>
    </div>
  );
}
