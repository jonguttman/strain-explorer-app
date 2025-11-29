// app/admin/AdminNav.tsx
// Shared navigation for admin pages

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/strains", label: "Strains" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/access", label: "Access Keys" },
    { href: "/admin/feedback", label: "Feedback" },
  ];

  return (
    <nav className="border-b border-[#e2d3b5] bg-[#fdfbf7] px-6 py-4">
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-xl font-semibold text-[#2d1d12] hover:text-[#4c3926]"
        >
          Psilly Admin
        </Link>
        <div className="flex gap-4">
          {links.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#4c3926] text-[#fdf6ec]"
                    : "text-[#4c3926] hover:bg-[#f6eddc]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

