"use client";

// =============================================================================
// ADMIN HEADER - Shared navigation for all /admin/* pages
// =============================================================================
// Provides consistent tab navigation and "Back to Tripdar" link across
// all admin routes. Highlights the active tab based on current pathname.
// =============================================================================

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_TABS = [
  { href: "/admin/tripdar-visual", label: "Tripdar Visual" },
  { href: "/admin/strains", label: "Strains" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/access", label: "Access Keys" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/guides/messages", label: "Guides" },
  { href: "/lab", label: "Lab" },
] as const;

export function AdminHeader() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-[var(--card-border)] pb-3 mb-6">
      {/* Left: Admin title + tabs */}
      <div className="flex items-center gap-6">
        <span className="text-sm font-semibold text-[var(--ink-main)] tracking-tight">
          Tripdar Admin
        </span>
        <nav className="flex items-center gap-1">
          {ADMIN_TABS.map(({ href, label }) => {
            const isActive = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  isActive
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--ink-soft)] hover:text-[var(--accent)] hover:bg-[var(--accent-pill)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Back to Tripdar */}
      <Link
        href="/"
        className="text-xs text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors"
      >
        ← Back to Tripdar
      </Link>
    </header>
  );
}

