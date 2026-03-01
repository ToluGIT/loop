export default function PeersLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-loop-bg)] p-6 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-44 rounded-lg bg-[var(--color-loop-surface-2)]" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-[var(--color-loop-surface-2)]" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-[var(--color-loop-surface)] p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[var(--color-loop-surface-2)]" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 rounded bg-[var(--color-loop-surface-2)]" />
                  <div className="h-3 w-48 rounded bg-[var(--color-loop-surface-2)]" />
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-6 w-20 rounded-full bg-[var(--color-loop-surface-2)]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
