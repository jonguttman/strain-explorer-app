"use client";

import Link from "next/link";

type AdminNavProps = {
  active: "strains" | "access" | "feedback";
};

export function AdminNav({ active }: AdminNavProps) {
  const links = [
    { href: "/admin/strains", label: "Strains", key: "strains" as const },
    { href: "/admin/access", label: "Access Keys", key: "access" as const },
    { href: "/admin/feedback", label: "Feedback", key: "feedback" as const },
  ];

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-semibold text-slate-900">Admin</h2>
          <div className="flex gap-4">
            {links.map((link) => {
              const isActive = link.key === active;
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`text-sm font-medium transition ${
                    isActive
                      ? "text-slate-900 border-b-2 border-slate-900 pb-1"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

