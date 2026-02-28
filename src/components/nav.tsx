"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/simulator", label: "Simulator" },
  { href: "/peers", label: "Peers" },
  { href: "/campus", label: "Campus" },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-[var(--color-loop-border)]"
      style={{
        background: "rgba(19, 19, 32, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-loop-primary)] to-[var(--color-loop-primary-hover)]"
        >
          Loop
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-loop-primary)] text-white"
                    : "text-[var(--color-loop-muted)] hover:text-[var(--color-loop-text)] hover:bg-[var(--color-loop-surface-2)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <button
          className="sm:hidden p-2 text-[var(--color-loop-muted)] hover:text-[var(--color-loop-text)]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[var(--color-loop-border)] px-4 pb-3 pt-2 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-loop-primary)] text-white"
                    : "text-[var(--color-loop-muted)] hover:text-[var(--color-loop-text)] hover:bg-[var(--color-loop-surface-2)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
