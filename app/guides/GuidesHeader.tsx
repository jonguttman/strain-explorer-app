"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { GuideAccount } from "@/lib/types";

type GuidesHeaderProps = {
  guide: GuideAccount;
};

export function GuidesHeader({ guide }: GuidesHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get initials from name
  const initials = guide.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/guides/logout", { method: "POST" });
      router.push("/");
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b border-[#e2d3b5]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Left: Logo + Wordmark */}
          <Link href="/guides/dashboard" className="flex items-center gap-2">
            <Image
              src="/roundrectangle-webmark.svg"
              alt="Psilly"
              width={28}
              height={28}
              className="opacity-90"
            />
            <span className="text-sm font-semibold text-[#3f301f]">
              Psilly Guides
            </span>
          </Link>

          {/* Center: Empty for now */}
          <div />

          {/* Right: Account menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 hover:bg-stone-50 transition"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3f301f] text-xs font-semibold text-white">
                {initials}
              </span>
              <span className="text-sm font-medium text-[#3f301f] hidden sm:inline">
                {guide.name}
              </span>
              <svg
                className="h-4 w-4 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-stone-200 bg-white shadow-lg z-20">
                  <div className="p-2">
                    <Link
                      href="#"
                      className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      My account
                    </Link>
                    <Link
                      href="/guides/messages"
                      className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Messages
                    </Link>
                  </div>
                  <div className="border-t border-stone-100 p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      {isLoggingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

