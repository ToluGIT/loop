export default function PulseLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-loop-bg)] p-6 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-40 rounded-lg bg-[var(--color-loop-surface-2)]" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-[var(--color-loop-surface)] p-5 space-y-2">
              <div className="h-4 w-28 rounded bg-[var(--color-loop-surface-2)]" />
              <div className="h-8 w-20 rounded bg-[var(--color-loop-surface-2)]" />
            </div>
          ))}
        </div>
        {/* Chart area */}
        <div className="rounded-2xl bg-[var(--color-loop-surface)] p-5">
          <div className="h-48 w-full rounded-lg bg-[var(--color-loop-surface-2)]" />
        </div>
        {/* Module mood cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-[var(--color-loop-surface)] p-5 space-y-3">
              <div className="h-5 w-44 rounded bg-[var(--color-loop-surface-2)]" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-8 flex-1 rounded-lg bg-[var(--color-loop-surface-2)]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
