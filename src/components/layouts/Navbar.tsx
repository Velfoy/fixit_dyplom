"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import "../../styles/navbar.css";

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAuthPage =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.includes("auth");

  // Determine logo link: dashboard if logged in, home otherwise
  const logoHref =
    session?.user &&
    typeof session.user.role === "string" &&
    session.user.role.length > 0
      ? `/${session.user.role.toLowerCase()}/dashboard`
      : "/";

  const userLabel = session?.user?.name
    ? `${session.user.name}`.trim()
    : session?.user?.email || session?.user?.name || "User";

  return (
    <header className="navbar">
      <nav className="navbar-inner">
        <div className="navbar-left">
          <Link href={logoHref} className="navbar-brand">
            <Image
              src="/images/logo_with_text_black1.png"
              alt="FixIt"
              width={90}
              className="navbar-brand-logo"
              height={38}
            />
          </Link>
        </div>

        <div className="navbar-actions">
          {isAuthPage ? (
            <Link href="/" className="navbar-btn">
              Home
            </Link>
          ) : !session ? (
            <Link href="/login" className="navbar-btn">
              Login
            </Link>
          ) : (
            <div className="navbar-user">
              <span className="navbar-user-label">{userLabel}</span>
              <button
                className="navbar-btn navbar-logout"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
