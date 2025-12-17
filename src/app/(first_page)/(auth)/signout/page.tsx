"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import "@/styles/auth.css";

export default function SignOutPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="auth-container v" style={{ minHeight: "83vh" }}>
      <div className="auth-wrapper">
        <div className="auth-content">
          <h1 className="auth-title">Sign Out</h1>
          <p className="auth-subtitle">
            Are you sure you want to sign out from your account?
          </p>

          <div className="auth-form">
            <button
              type="button"
              className="auth-submit"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing Out..." : "Yes, Sign Out"}
            </button>

            <button
              type="button"
              className="auth-cancel"
              onClick={handleCancel}
              disabled={isSigningOut}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
