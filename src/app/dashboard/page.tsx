"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Clock, ChevronDown, ChevronRight, Calendar } from "lucide-react";
import {
  calculateClassification,
  calculateModuleAverage,
  getClassificationColor,
  getClassificationShort,
} from "@/lib/classification";
import { generateInsights } from "@/lib/insights";
import { analyzeRisk } from "@/lib/risk-analysis";
import { calculateLeverage } from "@/lib/leverage";
import UserSwitcher from "@/components/user-switcher";

interface UserData {
  id: string;
  name: string;
  email: string;
  course: string;
  year: number;
}

interface AssessmentData {
  id: string;
  name: string;
  weight: number;
  dueDate: string | null;
  grade: { score: number } | null;
}

interface ModuleData {
  id: string;
  code: string;
  name: string;
  credits: number;
  level: number;
  assessments: AssessmentData[];
}

function getDeadlineStatus(dueDate: string | null): {
  label: string;
  color: string;
  urgent: boolean;
} {
  if (!dueDate) return { label: "", color: "", urgent: false };
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return { label: `${Math.abs(diffDays)}d ago`, color: "text-[var(--color-loop-muted)]", urgent: false };
  if (diffDays <= 7)
    return { label: `${diffDays}d left`, color: "text-red-400", urgent: true };
  if (diffDays <= 21)
    return { label: `${diffDays}d left`, color: "text-amber-400", urgent: false };
  return { label: `${diffDays}d left`, color: "text-[var(--color-loop-muted)]", urgent: false };
}

function formatDate(dueDate: string | null): string {
  if (!dueDate) return "";
  return new Date(dueDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const [userId, setUserId] = useState("first");
  const [user, setUser] = useState<UserData | null>(null);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showAllInsights, setShowAllInsights] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/simulator/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setModules(data.modules);
        setExpandedModules(new Set());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleUserSwitch = useCallback((id: string) => setUserId(id), []);

  const toggleModule = useCallback((modId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId);
      else next.add(modId);
      return next;
    });
  }, []);

  // Calculations
  const modulesForCalc = useMemo(
    () =>
      modules.map((mod) => ({
        ...mod,
        assessments: mod.assessments.map((a) => ({
          id: a.id,
          name: a.name,
          weight: a.weight,
          grade: a.grade,
        })),
      })),
    [modules]
  );

  const result = useMemo(
    () => calculateClassification(modulesForCalc),
    [modulesForCalc]
  );
  const classColor = getClassificationColor(result.classification);
  const classShort = getClassificationShort(result.classification);

  const moduleStats = useMemo(
    () =>
      modules.map((mod) => {
        const avg = calculateModuleAverage(mod);
        return {
          ...mod,
          average: avg?.average ?? null,
          completionRatio: avg?.completionRatio ?? 0,
          gradedCount: mod.assessments.filter((a) => a.grade?.score != null).length,
          totalCount: mod.assessments.length,
        };
      }),
    [modules]
  );

  const insights = useMemo(
    () => generateInsights(modulesForCalc, result),
    [modulesForCalc, result]
  );
  const risk = useMemo(
    () => analyzeRisk(modulesForCalc, result.classification, result.weightedAverage),
    [modulesForCalc, result]
  );
  const topLeverage = useMemo(
    () => calculateLeverage(modulesForCalc).slice(0, 5),
    [modulesForCalc]
  );

  // Upcoming deadlines (ungraded assessments with due dates, sorted by date)
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const items: { assessment: AssessmentData; moduleCode: string; moduleName: string }[] = [];
    for (const mod of modules) {
      for (const a of mod.assessments) {
        if (!a.grade && a.dueDate && new Date(a.dueDate) > now) {
          items.push({ assessment: a, moduleCode: mod.code, moduleName: mod.name });
        }
      }
    }
    return items.sort(
      (a, b) =>
        new Date(a.assessment.dueDate!).getTime() -
        new Date(b.assessment.dueDate!).getTime()
    );
  }, [modules]);

  const riskColors = {
    safe: { border: "border-emerald-500/30", text: "text-emerald-400", label: "Secure" },
    watch: { border: "border-amber-500/30", text: "text-amber-400", label: "Watch" },
    danger: { border: "border-red-500/30", text: "text-red-400", label: "At Risk" },
  };
  const riskStyle = riskColors[risk.riskLevel];

  const insightTypeColors: Record<string, string> = {
    success: "border-emerald-500/30 bg-emerald-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    info: "border-blue-500/30 bg-blue-500/5",
    action: "border-[var(--color-loop-primary)]/30 bg-[var(--color-loop-primary)]/5",
  };

  const insightIconColors: Record<string, string> = {
    success: "text-emerald-400",
    warning: "text-amber-400",
    info: "text-blue-400",
    action: "text-[var(--color-loop-primary)]",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-loop-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen px-4 py-8 max-w-5xl mx-auto animate-fade-in-up">
      {/* Header */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-[var(--color-loop-muted)] mt-1">
            {user.course} &middot; Year {user.year}
          </p>
        </div>
        <UserSwitcher currentUserId={user.id} onSwitch={handleUserSwitch} />
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-stagger">
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
          {(result.level5Average !== null || result.level6Average !== null) && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--color-loop-border)] text-sm">
              {result.level5Average !== null && (
                <span className="text-[var(--color-loop-accent)]">L5: {result.level5Average}%</span>
              )}
              {result.level6Average !== null && (
                <span className="text-[var(--color-loop-primary)]">L6: {result.level6Average}%</span>
              )}
            </div>
          )}
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
          <div className="w-full mt-3 h-3 rounded-full bg-[var(--color-loop-surface-2)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${
                  result.totalCredits > 0
                    ? (result.creditsCompleted / result.totalCredits) * 100
                    : 0
                }%`,
                background: "linear-gradient(90deg, var(--color-loop-primary), var(--color-loop-primary-hover))",
                boxShadow: "0 0 8px rgba(249, 115, 84, 0.4)",
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
            <p className="text-sm text-[var(--color-loop-muted)] mt-2">
              Safe above {risk.dropThreshold}% avg
            </p>
          )}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock size={18} className="text-[var(--color-loop-primary)]" />
            Upcoming Deadlines
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 animate-stagger">
            {upcomingDeadlines.slice(0, 6).map((item) => {
              const status = getDeadlineStatus(item.assessment.dueDate);
              return (
                <div
                  key={item.assessment.id}
                  className={`loop-card p-4 min-w-[200px] shrink-0 ${
                    status.urgent ? "border border-red-500/30 glow-urgent" : ""
                  }`}
                >
                  <p className="text-sm font-mono text-[var(--color-loop-muted)]">
                    {item.moduleCode}
                  </p>
                  <p className="text-base font-medium text-[var(--color-loop-text)] mt-1 line-clamp-1">
                    {item.assessment.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Calendar size={12} className={status.color} />
                    <span className={`text-sm font-medium ${status.color}`}>
                      {formatDate(item.assessment.dueDate)}
                    </span>
                  </div>
                  <p className={`text-sm font-bold mt-1 ${status.color}`}>
                    {status.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Smart Insights */}
      {insights.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Smart Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.slice(0, showAllInsights ? insights.length : 4).map((insight, i) => (
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
                    <p className="text-base font-semibold text-[var(--color-loop-text)]">
                      {insight.title}
                    </p>
                    <p className="text-sm text-[var(--color-loop-muted)] mt-1 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {insights.length > 4 && (
            <button
              onClick={() => setShowAllInsights(!showAllInsights)}
              className="mt-3 text-sm font-medium text-[var(--color-loop-primary)] hover:text-[var(--color-loop-primary-hover)] transition-colors cursor-pointer"
            >
              {showAllInsights ? "Show less" : `Show ${insights.length - 4} more insights`}
            </button>
          )}
        </div>
      )}

      {/* Highest Impact Assessments */}
      {topLeverage.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Highest Impact Assessments</h2>
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

      {/* Module Cards - Expandable */}
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

          const isExpanded = expandedModules.has(mod.id);

          // Find nearest upcoming deadline for this module
          const nextDeadline = mod.assessments
            .filter((a) => !a.grade && a.dueDate && new Date(a.dueDate) > new Date())
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];
          const deadlineStatus = nextDeadline ? getDeadlineStatus(nextDeadline.dueDate) : null;

          return (
            <div key={mod.id} className="loop-card overflow-hidden">
              {/* Clickable header */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full p-5 text-left hover:bg-[var(--color-loop-surface-2)]/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown size={14} className="text-[var(--color-loop-muted)]" />
                    ) : (
                      <ChevronRight size={14} className="text-[var(--color-loop-muted)]" />
                    )}
                    <span className="text-sm font-mono text-[var(--color-loop-muted)]">
                      {mod.code}
                    </span>
                    <span className="text-[var(--color-loop-border)]">|</span>
                    <span className="text-sm text-[var(--color-loop-muted)]">
                      L{mod.level} &middot; {mod.credits} credits
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {deadlineStatus && deadlineStatus.urgent && (
                      <span className={`text-sm font-medium ${deadlineStatus.color} flex items-center gap-1`}>
                        <Clock size={10} />
                        {deadlineStatus.label}
                      </span>
                    )}
                    <span className="text-sm text-[var(--color-loop-muted)]">
                      {mod.gradedCount}/{mod.totalCount} graded
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold text-base mb-3">{mod.name}</h3>

                {/* Performance bar */}
                <div className="w-full h-3 rounded-full bg-[var(--color-loop-surface-2)] overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${barWidth}%`,
                      background: `linear-gradient(90deg, ${barColor}, ${barColor}dd)`,
                      boxShadow: `0 0 8px ${barColor}66`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold" style={{ color: barColor }}>
                    {mod.average !== null
                      ? `${Math.round(mod.average * 10) / 10}%`
                      : "No grades"}
                  </span>
                  <span className="text-sm text-[var(--color-loop-muted)]">
                    {Math.round(mod.completionRatio * 100)}% complete
                  </span>
                </div>
              </button>

              {/* Expanded assessment details */}
              {isExpanded && (
                <div className="border-t border-[var(--color-loop-border)] px-5 py-3 space-y-2 bg-[var(--color-loop-surface-2)]/30 expand-enter">
                  {mod.assessments.map((a) => {
                    const dlStatus = getDeadlineStatus(a.dueDate);
                    return (
                      <div
                        key={a.id}
                        className="flex items-center justify-between py-2 text-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-sm font-mono text-[var(--color-loop-muted)] w-12 shrink-0">
                            {Math.round(a.weight * 100)}%
                          </span>
                          <span className="text-[var(--color-loop-text)] truncate">
                            {a.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {a.dueDate && (
                            <span className={`text-sm flex items-center gap-1 ${dlStatus.color}`}>
                              <Calendar size={10} />
                              {formatDate(a.dueDate)}
                            </span>
                          )}
                          {a.grade ? (
                            <span
                              className="font-mono font-bold text-sm min-w-[3rem] text-right"
                              style={{
                                color:
                                  a.grade.score >= 70
                                    ? "var(--color-loop-green)"
                                    : a.grade.score >= 60
                                      ? "var(--color-loop-gold)"
                                      : a.grade.score >= 50
                                        ? "var(--color-loop-amber)"
                                        : "var(--color-loop-red)",
                              }}
                            >
                              {a.grade.score}%
                            </span>
                          ) : (
                            <span className="text-sm text-[var(--color-loop-muted)] italic">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
