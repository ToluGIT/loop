export default function CampusLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-loop-bg)] p-6 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-44 rounded-lg bg-[var(--color-loop-surface-2)]" />
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-[var(--color-loop-surface)] p-5 space-y-2">
              <div className="h-4 w-24 rounded bg-[var(--color-loop-surface-2)]" />
              <div className="h-8 w-16 rounded bg-[var(--color-loop-surface-2)]" />
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="rounded-2xl bg-[var(--color-loop-surface)] p-5 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full rounded-lg bg-[var(--color-loop-surface-2)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
