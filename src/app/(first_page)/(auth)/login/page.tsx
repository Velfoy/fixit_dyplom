"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "login") {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) router.push("/redirect");
      else alert("Invalid credentials");
      return;
    }

    // REGISTER
    if (password !== repeatPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!firstName || !lastName || !phone) {
      alert("Please fill in first name, last name and phone.");
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
      alert("Registration successful! You can now log in.");
      setMode("login");
      setEmail("");
      setPassword("");
      setRepeatPassword("");
      setFirstName("");
      setLastName("");
      setPhone("");
    } else {
      alert(data.error || "Registration failed.");
      console.log("Registration error:", data);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col w-72 gap-3">
        <h1 className="text-xl font-semibold mb-2 text-center">
          {mode === "login" ? "Login" : "Register"}
        </h1>

        {/* Common fields */}
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Register-only fields */}
        {mode === "register" && (
          <>
            <input
              type="password"
              placeholder="Repeat password"
              className="border p-2 rounded"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
            <input
              type="text"
              placeholder="First name"
              className="border p-2 rounded"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last name"
              className="border p-2 rounded"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone number"
              className="border p-2 rounded"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </>
        )}

        <button type="submit" className="bg-blue-600 text-white py-2 rounded">
          {mode === "login" ? "Log in" : "Register"}
        </button>
      </form>

      <button
        className="mt-4 text-sm text-blue-500 underline"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login"
          ? "Don't have an account? Register"
          : "Already have an account? Log in"}
      </button>
    </main>
  );
}
