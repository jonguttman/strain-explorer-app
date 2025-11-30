"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function GuidesLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/guides/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.ok) {
        router.push("/guides/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6eddc] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/TOPsilly2026.svg"
            alt="The Original Psilly"
            width={160}
            height={32}
            priority
          />
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl border border-[#ddcbaa] shadow-lg p-8">
          <h1 className="text-xl font-semibold text-[#3f301f] text-center mb-2">
            Psilly Guides
          </h1>
          <p className="text-sm text-stone-600 text-center mb-6">
            Sign in to access the guide portal
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm text-[#3f301f] focus:outline-none focus:ring-2 focus:ring-[#3f301f] focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm text-[#3f301f] focus:outline-none focus:ring-2 focus:ring-[#3f301f] focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!username || !password || isLoading}
              className="w-full rounded-full bg-[#3f301f] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d2216] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        {/* Back link */}
        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-stone-500 hover:text-stone-700 underline"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

