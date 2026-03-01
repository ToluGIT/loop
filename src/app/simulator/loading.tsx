export default function SimulatorLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-loop-bg)] p-6 animate-pulse">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-52 rounded-lg bg-[var(--color-loop-surface-2)]" />
          <div className="h-10 w-36 rounded-lg bg-[var(--color-loop-surface-2)]" />
        </div>

        {/* Classification + stats row */}
        <div className="rounded-2xl bg-[var(--color-loop-surface)] p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-[var(--color-loop-surface-2)]" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 rounded bg-[var(--color-loop-surface-2)]" />
              <div className="h-4 w-64 rounded bg-[var(--color-loop-surface-2)]" />
            </div>
          </div>
          {/* Boundary bar */}
          <div className="h-10 w-full rounded-lg bg-[var(--color-loop-surface-2)]" />
          {/* Grade needed cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 rounded-xl bg-[var(--color-loop-surface-2)]" />
            <div className="h-20 rounded-xl bg-[var(--color-loop-surface-2)]" />
          </div>
        </div>

        {/* Preset buttons */}
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-32 rounded-lg bg-[var(--color-loop-surface-2)]" />
          ))}
        </div>

        {/* Module sliders */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-[var(--color-loop-surface)] p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-5 w-48 rounded bg-[var(--color-loop-surface-2)]" />
              <div className="h-5 w-16 rounded bg-[var(--color-loop-surface-2)]" />
            </div>
            <div className="h-8 w-full rounded bg-[var(--color-loop-surface-2)]" />
            <div className="h-8 w-full rounded bg-[var(--color-loop-surface-2)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
