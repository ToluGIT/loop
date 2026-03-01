export default function SpotsLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-loop-bg)] p-6 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-40 rounded-lg bg-[var(--color-loop-surface-2)]" />
        {/* Map placeholder */}
        <div className="h-64 w-full rounded-2xl bg-[var(--color-loop-surface)]" />
        {/* Spot cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-[var(--color-loop-surface)] p-5 space-y-3">
              <div className="h-5 w-40 rounded bg-[var(--color-loop-surface-2)]" />
              <div className="h-4 w-28 rounded bg-[var(--color-loop-surface-2)]" />
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-[var(--color-loop-surface-2)]" />
                <div className="h-6 w-16 rounded-full bg-[var(--color-loop-surface-2)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
