import { prisma } from "@/lib/db";
import {
  calculateClassification,
  calculateModuleAverage,
  getClassificationColor,
  getClassificationShort,
} from "@/lib/classification";
import Link from "next/link";

export default async function DashboardPage() {
  // Fetch the first user with all nested data
  const user = await prisma.user.findFirst({
    include: {
      modules: {
        include: {
          assessments: {
            include: {
              grades: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loop-card p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">No Data Found</h1>
          <p className="text-[var(--color-loop-muted)]">
            Run the seed script to populate demo data.
          </p>
        </div>
      </div>
    );
  }

  // Transform modules to the shape classification functions expect
  // Each assessment needs a single grade (take the first one for this user)
  const modulesForCalc = user.modules.map((mod) => ({
    id: mod.id,
    code: mod.code,
    name: mod.name,
    credits: mod.credits,
    level: mod.level,
    assessments: mod.assessments.map((a) => ({
      id: a.id,
      name: a.name,
      weight: a.weight,
      grade: a.grades.length > 0 ? { score: a.grades[0].score } : null,
    })),
  }));

  const result = calculateClassification(modulesForCalc);
  const classColor = getClassificationColor(result.classification);
  const classShort = getClassificationShort(result.classification);

  // Per-module stats
  const moduleStats = modulesForCalc.map((mod) => {
    const avg = calculateModuleAverage(mod);
    const totalAssessments = mod.assessments.length;
    const gradedAssessments = mod.assessments.filter(
      (a) => a.grade?.score != null
    ).length;
    return {
      ...mod,
      average: avg?.average ?? null,
      completionRatio: avg?.completionRatio ?? 0,
      gradedCount: gradedAssessments,
      totalCount: totalAssessments,
    };
  });

  return (
    <div className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-[var(--color-loop-muted)] mt-1">
            {user.course} &middot; Year {user.year}
          </p>
        </div>
        <nav className="flex gap-3">
          <Link
            href="/simulator"
            className="px-4 py-2 rounded-lg bg-[var(--color-loop-surface-2)] border border-[var(--color-loop-border)] text-sm font-medium hover:border-[var(--color-loop-primary)] transition-colors"
          >
            What-If Simulator
          </Link>
          <Link
            href="/peers"
            className="px-4 py-2 rounded-lg bg-[var(--color-loop-surface-2)] border border-[var(--color-loop-border)] text-sm font-medium hover:border-[var(--color-loop-primary)] transition-colors"
          >
            Find Peers
          </Link>
        </nav>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Classification Badge */}
        <div className="loop-card p-6 flex flex-col items-center justify-center text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--color-loop-muted)] mb-3">
            Projected Classification
          </p>
          <div
            className="classification-badge text-5xl font-extrabold mb-2"
            style={{ color: classColor }}
          >
            {classShort}
          </div>
          <p className="text-sm" style={{ color: classColor }}>
            {result.classification}
          </p>
        </div>

        {/* Weighted Average */}
        <div className="loop-card p-6 flex flex-col items-center justify-center text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--color-loop-muted)] mb-3">
            Weighted Average
          </p>
          <div className="text-5xl font-extrabold text-[var(--color-loop-text)]">
            {result.weightedAverage}
            <span className="text-2xl text-[var(--color-loop-muted)]">%</span>
          </div>
          <p className="text-sm text-[var(--color-loop-muted)] mt-1">
            {result.confidence > 0
              ? `${Math.round(result.confidence * 100)}% confidence`
              : "No grades yet"}
          </p>
        </div>

        {/* Credits Progress */}
        <div className="loop-card p-6 flex flex-col items-center justify-center text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--color-loop-muted)] mb-3">
            Credits Graded
          </p>
          <div className="text-5xl font-extrabold text-[var(--color-loop-text)]">
            {result.creditsCompleted}
            <span className="text-2xl text-[var(--color-loop-muted)]">
              /{result.totalCredits}
            </span>
          </div>
          <div className="w-full mt-3 h-2 rounded-full bg-[var(--color-loop-surface-2)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-loop-primary)] transition-all"
              style={{
                width: `${
                  result.totalCredits > 0
                    ? (result.creditsCompleted / result.totalCredits) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Level Averages */}
      {(result.level5Average !== null || result.level6Average !== null) && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {result.level5Average !== null && (
            <div className="loop-card p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-[var(--color-loop-muted)] mb-1">
                Level 5 Average
              </p>
              <p className="text-2xl font-bold">{result.level5Average}%</p>
              <p className="text-xs text-[var(--color-loop-muted)]">
                weighted 1/3
              </p>
            </div>
          )}
          {result.level6Average !== null && (
            <div className="loop-card p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-[var(--color-loop-muted)] mb-1">
                Level 6 Average
              </p>
              <p className="text-2xl font-bold">{result.level6Average}%</p>
              <p className="text-xs text-[var(--color-loop-muted)]">
                weighted 2/3
              </p>
            </div>
          )}
        </div>
      )}

      {/* Module Cards */}
      <h2 className="text-xl font-semibold mb-4">Modules</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {moduleStats.map((mod) => {
          const barColor =
            mod.average !== null
              ? mod.average >= 70
                ? "var(--color-loop-green)"
                : mod.average >= 60
                  ? "var(--color-loop-gold)"
                  : mod.average >= 50
                    ? "var(--color-loop-amber)"
                    : "var(--color-loop-red)"
              : "var(--color-loop-border)";

          const barWidth =
            mod.average !== null ? Math.min(mod.average, 100) : 0;

          return (
            <div key={mod.id} className="loop-card p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-mono text-[var(--color-loop-muted)]">
                    {mod.code}
                  </span>
                  <span className="mx-2 text-[var(--color-loop-border)]">
                    |
                  </span>
                  <span className="text-xs text-[var(--color-loop-muted)]">
                    L{mod.level} &middot; {mod.credits} credits
                  </span>
                </div>
                <span className="text-xs text-[var(--color-loop-muted)]">
                  {mod.gradedCount}/{mod.totalCount} graded
                </span>
              </div>
              <h3 className="font-semibold text-base mb-3">{mod.name}</h3>

              {/* Performance bar */}
              <div className="w-full h-2 rounded-full bg-[var(--color-loop-surface-2)] overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span
                  className="text-lg font-bold"
                  style={{ color: barColor }}
                >
                  {mod.average !== null
                    ? `${Math.round(mod.average * 10) / 10}%`
                    : "No grades"}
                </span>
                <span className="text-xs text-[var(--color-loop-muted)]">
                  {Math.round(mod.completionRatio * 100)}% complete
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer nav */}
      <div className="mt-10 pt-6 border-t border-[var(--color-loop-border)] flex justify-center gap-6 text-sm text-[var(--color-loop-muted)]">
        <Link
          href="/simulator"
          className="hover:text-[var(--color-loop-primary)] transition-colors"
        >
          What-If Simulator
        </Link>
        <Link
          href="/peers"
          className="hover:text-[var(--color-loop-primary)] transition-colors"
        >
          Peer Matching
        </Link>
      </div>
    </div>
  );
}
