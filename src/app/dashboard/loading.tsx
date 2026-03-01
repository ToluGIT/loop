export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-loop-bg)] p-6 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded-lg bg-[var(--color-loop-surface-2)]" />
          <div className="h-10 w-36 rounded-lg bg-[var(--color-loop-surface-2)]" />
        </div>

        {/* Classification card skeleton */}
        <div className="rounded-2xl bg-[var(--color-loop-surface)] p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-[var(--color-loop-surface-2)]" />
            <div className="space-y-2">
              <div className="h-6 w-40 rounded bg-[var(--color-loop-surface-2)]" />
              <div className="h-4 w-56 rounded bg-[var(--color-loop-surface-2)]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-[var(--color-loop-surface-2)]" />
            ))}
          </div>
        </div>

        {/* Module cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-[var(--color-loop-surface)] p-5 space-y-3">
              <div className="flex justify-between">
                <div className="h-5 w-44 rounded bg-[var(--color-loop-surface-2)]" />
                <div className="h-5 w-16 rounded bg-[var(--color-loop-surface-2)]" />
              </div>
              <div className="h-3 w-full rounded bg-[var(--color-loop-surface-2)]" />
              <div className="h-3 w-3/4 rounded bg-[var(--color-loop-surface-2)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
