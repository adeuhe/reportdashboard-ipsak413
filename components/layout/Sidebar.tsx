"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Dashboard", href: "/" },
  { label: "Strategic Dashboard", href: "/strategic-dashboard" },
  { label: "Financial Impact", href: "/financial-impact-dashboard" }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 flex-shrink-0 border-r bg-white md:block">
      <div className="px-5 py-4">
        <div className="text-xs font-semibold text-slate-500">PT Madani IntelsysData</div>
        <div className="mt-1 text-sm font-bold text-slate-900">Risk Console</div>
      </div>

      <nav className="px-3 py-2">
        {nav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-semibold ${
                isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-5 py-4 text-xs text-slate-500">
        Version 0.1 • PSAK 413
      </div>
    </aside>
  );
}
