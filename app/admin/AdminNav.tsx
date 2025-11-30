"use client";

import Link from "next/link";

type AdminNavProps = {
  active: "strains" | "access" | "feedback" | "products";
  title?: string;
  subtitle?: string;
};

export function AdminNav({ active, title, subtitle }: AdminNavProps) {
  const links = [
    { href: "/admin/strains", label: "Strains", key: "strains" as const },
    { href: "/admin/products", label: "Products", key: "products" as const },
    { href: "/admin/access", label: "Access Keys", key: "access" as const },
    { href: "/admin/feedback", label: "Feedback", key: "feedback" as const },
  ];

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-sm font-semibold text-slate-900">Admin</span>
            <div className="flex items-center gap-6">
              {links.map((link) => {
                const isActive = link.key === active;
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    className={`relative text-sm font-medium transition ${
                      isActive
                        ? "text-slate-900"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-slate-900" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          {title && (
            <div className="flex items-center gap-3">
              {subtitle && (
                <span className="text-xs text-slate-500 hidden sm:inline">{subtitle}</span>
              )}
              <h1 className="text-sm font-semibold text-slate-700">{title}</h1>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
