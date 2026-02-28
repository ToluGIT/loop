"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface User {
  id: string;
  name: string;
  course: string;
  year: number;
}

export default function UserSwitcher({
  currentUserId,
  onSwitch,
}: {
  currentUserId: string;
  onSwitch: (userId: string) => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(data))
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = users.find((u) => u.id === currentUserId);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-loop-surface)] border border-[var(--color-loop-border)] hover:border-[var(--color-loop-primary)] transition-colors text-sm"
      >
        <span className="text-[var(--color-loop-text)]">
          {current?.name ?? "Select Student"}
        </span>
        <ChevronDown size={14} className="text-[var(--color-loop-muted)]" />
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 w-64 bg-[var(--color-loop-surface)] border border-[var(--color-loop-border)] rounded-xl shadow-xl z-50 overflow-hidden">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                onSwitch(u.id);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-[var(--color-loop-surface-2)] transition-colors ${
                u.id === currentUserId
                  ? "bg-[var(--color-loop-primary)]/10 border-l-2 border-l-[var(--color-loop-primary)]"
                  : ""
              }`}
            >
              <div className="text-sm font-medium text-[var(--color-loop-text)]">
                {u.name}
              </div>
              <div className="text-xs text-[var(--color-loop-muted)]">
                {u.course} &middot; Year {u.year}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
