import { prisma } from "@/lib/db";
import {
  calculateClassification,
  calculateModuleAverage,
  getClassificationColor,
  getClassificationShort,
} from "@/lib/classification";
import { generateInsights } from "@/lib/insights";
import { analyzeRisk } from "@/lib/risk-analysis";
import { calculateLeverage } from "@/lib/leverage";

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

  // Innovation features
  const insights = generateInsights(modulesForCalc, result);
  const risk = analyzeRisk(modulesForCalc, result.classification, result.weightedAverage);
  const leverage = calculateLeverage(modulesForCalc);
  const topLeverage = leverage.slice(0, 5);

  const riskColors = {
    safe: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", label: "Secure" },
    watch: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", label: "Watch" },
    danger: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", label: "At Risk" },
  };
  const riskStyle = riskColors[risk.riskLevel];

  const insightTypeColors = {
    success: "border-emerald-500/30 bg-emerald-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    info: "border-blue-500/30 bg-blue-500/5",
    action: "border-purple-500/30 bg-purple-500/5",
  };

  const insightIconColors = {
    success: "text-emerald-400",
    warning: "text-amber-400",
    info: "text-blue-400",
    action: "text-purple-400",
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-5xl mx-auto animate-fade-in-up">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{user.name}</h1>
        <p className="text-[var(--color-loop-muted)] mt-1">
          {user.course} &middot; Year {user.year}
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Classification Badge */}
        <div className="loop-card p-6 flex flex-col items-center justify-center text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--color-loop-muted)] mb-3">
            Projected Classification
          </p>
          <div
            className="classification-badge text-4xl font-bold mb-2"
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
          <div className="text-4xl font-bold text-[var(--color-loop-text)]">
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
          <div className="text-4xl font-bold text-[var(--color-loop-text)]">
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

        {/* Risk Analysis */}
        <div className={`loop-card p-6 flex flex-col items-center justify-center text-center border ${riskStyle.border}`}>
          <p className="text-xs uppercase tracking-widest text-[var(--color-loop-muted)] mb-3">
            Boundary Risk
          </p>
          <div className={`text-4xl font-bold ${riskStyle.text}`}>
            {risk.distanceAbove > 0 ? `+${risk.distanceAbove}` : risk.distanceAbove}
            <span className="text-2xl text-[var(--color-loop-muted)]">%</span>
          </div>
          <p className={`text-sm font-medium mt-1 ${riskStyle.text}`}>
            {riskStyle.label}
          </p>
          {risk.dropThreshold !== null && (
            <p className="text-xs text-[var(--color-loop-muted)] mt-2">
              Safe above {risk.dropThreshold}% avg
            </p>
          )}
        </div>
      </div>

      {/* Level Averages */}
      {(result.level5Average !== null || result.level6Average !== null) && (
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {result.level5Average !== null && (
            <div className="loop-card p-4 text-center flex-1 min-w-[200px] max-w-xs">
              <p className="text-xs uppercase tracking-widest text-[var(--color-loop-muted)] mb-1">
                Level 5 Average
              </p>
              <p className="text-2xl font-bold text-blue-300">{result.level5Average}%</p>
              <p className="text-xs text-[var(--color-loop-muted)]">
                weighted 1/3
              </p>
            </div>
          )}
          {result.level6Average !== null && (
            <div className="loop-card p-4 text-center flex-1 min-w-[200px] max-w-xs">
              <p className="text-xs uppercase tracking-widest text-[var(--color-loop-muted)] mb-1">
                Level 6 Average
              </p>
              <p className="text-2xl font-bold text-purple-300">{result.level6Average}%</p>
              <p className="text-xs text-[var(--color-loop-muted)]">
                weighted 2/3
              </p>
            </div>
          )}
        </div>
      )}

      {/* Smart Insights */}
      {insights.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Smart Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`loop-card p-4 border ${insightTypeColors[insight.type]}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-lg ${insightIconColors[insight.type]}`}>
                    {insight.icon === "TrendingUp" && "↗"}
                    {insight.icon === "AlertTriangle" && "⚠"}
                    {insight.icon === "Target" && "◎"}
                    {insight.icon === "PieChart" && "◔"}
                    {insight.icon === "CheckCircle" && "✓"}
                    {insight.icon === "Award" && "★"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-loop-text)]">
                      {insight.title}
                    </p>
                    <p className="text-xs text-[var(--color-loop-muted)] mt-1 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grade Leverage - Top Impact Assessments */}
      {topLeverage.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Highest Impact Assessments</h2>
          <div className="loop-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-loop-border)] text-[var(--color-loop-muted)]">
                    <th className="text-left py-3 px-4 font-medium">#</th>
                    <th className="text-left py-3 px-4 font-medium">Assessment</th>
                    <th className="text-left py-3 px-4 font-medium">Module</th>
                    <th className="text-right py-3 px-4 font-medium">Impact</th>
                    <th className="text-right py-3 px-4 font-medium">Boundary</th>
                  </tr>
                </thead>
                <tbody>
                  {topLeverage.map((item, i) => (
                    <tr
                      key={item.assessmentId}
                      className="border-b border-[var(--color-loop-border)] last:border-0 hover:bg-[var(--color-loop-surface-2)] transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[var(--color-loop-muted)]">
                        {i + 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-[var(--color-loop-text)]">
                        {item.assessmentName}
                      </td>
                      <td className="py-3 px-4 text-[var(--color-loop-muted)] font-mono text-xs">
                        {item.moduleCode}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-semibold text-[var(--color-loop-primary)]">
                          {(item.leverage * 100).toFixed(1)}%
                        </span>
                        <span className="text-xs text-[var(--color-loop-muted)] ml-1">per 1%</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.crossesBoundary ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30">
                            Near boundary
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--color-loop-muted)]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Module Cards */}
      <h2 className="text-lg font-semibold mb-4">Modules</h2>
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

    </div>
  );
}
