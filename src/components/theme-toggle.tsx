"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="p-2.5 rounded-xl bg-[var(--color-loop-surface)] border border-[var(--color-loop-border)] text-[var(--color-loop-muted)] hover:text-[var(--color-loop-text)] hover:border-[var(--color-loop-primary)] transition-all cursor-pointer shadow-lg"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
