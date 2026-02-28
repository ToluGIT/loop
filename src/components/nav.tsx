"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/simulator", label: "Simulator" },
  { href: "/peers", label: "Peers" },
  { href: "/campus", label: "Campus" },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <nav
      className="sticky top-0 z-50 border-b border-[var(--color-loop-border)]"
      style={{
        background: "var(--color-loop-nav-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-loop-primary)] to-[var(--color-loop-primary-hover)]"
        >
          Loop
        </Link>

        {/* Desktop links + theme toggle */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-[var(--color-loop-primary)] text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                    : "text-[var(--color-loop-muted)] hover:text-[var(--color-loop-text)] hover:bg-[var(--color-loop-surface-2)]"
                }`}
              >
                {label}
              </Link>
            );
          })}

          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="ml-2 p-2 rounded-lg text-[var(--color-loop-muted)] hover:text-[var(--color-loop-text)] hover:bg-[var(--color-loop-surface-2)] transition-all cursor-pointer"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="sm:hidden flex items-center gap-1">
          <button
            onClick={toggle}
            className="p-2 text-[var(--color-loop-muted)] hover:text-[var(--color-loop-text)] cursor-pointer"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="p-2 text-[var(--color-loop-muted)] hover:text-[var(--color-loop-text)] cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[var(--color-loop-border)] px-4 pb-3 pt-2 flex flex-col gap-1 expand-enter">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
