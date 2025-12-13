"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "@/styles/auth.css";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "login") {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) router.push("/redirect");
      else setError("Invalid email or password");
      return;
    }

    // REGISTER
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!firstName || !lastName || !phone) {
      setError("Please fill in all fields");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        phone,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setSuccess("Registration successful! You can now log in.");
      setTimeout(() => {
        setMode("login");
        setEmail("");
        setPassword("");
        setRepeatPassword("");
        setFirstName("");
        setLastName("");
        setPhone("");
        setSuccess("");
      }, 1500);
    } else {
      setError(data.error || "Registration failed.");
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-brand">
            <Image
              src="/images/logo_white_text.png"
              alt="FixIt"
              width={100}
              height={40}
            />
          </div>

          <h1 className="auth-title">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Sign in to your account to access your orders and services"
              : "Join us and manage your automotive services with ease"}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            {/* Email */}
            <div className="auth-form-row full">
              <input
                type="email"
                placeholder="Email address"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="auth-form-row full">
              <input
                type="password"
                placeholder="Password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Register-only fields */}
            {mode === "register" && (
              <>
                <div className="auth-form-row full">
                  <input
                    type="password"
                    placeholder="Confirm password"
                    className="auth-input"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-form-row">
                  <input
                    type="text"
                    placeholder="First name"
                    className="auth-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    className="auth-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-form-row full">
                  <input
                    type="tel"
                    placeholder="Phone number"
                    className="auth-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" className="auth-submit">
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>

            <div className="auth-toggle">
              <span className="auth-toggle-text">
                {mode === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </span>
              <button
                type="button"
                className="auth-toggle-button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                  setSuccess("");
                }}
              >
                {mode === "login" ? "Register" : "Sign In"}
              </button>
            </div>
          </form>
        </div>

        <div className="auth-illustration">
          <div className="auth-illustration-content">
            <div className="auth-illustration-icon">🔧</div>
            <div className="auth-illustration-title">FixIt</div>
            <div className="auth-illustration-text">
              Manage your automotive repairs and maintenance in one place.
              Quick, reliable, and professional service at your fingertips.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
