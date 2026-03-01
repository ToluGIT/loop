"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, BookOpen, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface CampusStats {
  totalStudents: number;
  overallBreakdown: {
    first: number;
    upperSecond: number;
    lowerSecond: number;
    third: number;
    fail: number;
  };
  moduleStats: Array<{
    code: string;
    name: string;
    avg: number;
    students: number;
    firstPct: number;
  }>;
  weeklyTrend: Array<{ week: string; avgConfidence: number }>;
}

const EMPTY_STATS: CampusStats = {
  totalStudents: 0,
  overallBreakdown: { first: 0, upperSecond: 0, lowerSecond: 0, third: 0, fail: 0 },
  moduleStats: [],
  weeklyTrend: [
    { week: "W1", avgConfidence: 60 },
    { week: "W2", avgConfidence: 60 },
    { week: "W3", avgConfidence: 60 },
    { week: "W4", avgConfidence: 60 },
    { week: "W5", avgConfidence: 60 },
    { week: "W6", avgConfidence: 60 },
    { week: "W7", avgConfidence: 60 },
    { week: "W8", avgConfidence: 60 },
  ],
};

function avgColor(avg: number) {
  if (avg >= 70) return "text-[var(--color-loop-green)]";
  if (avg >= 60) return "text-[var(--color-loop-gold)]";
  if (avg >= 50) return "text-[var(--color-loop-amber)]";
  return "text-[var(--color-loop-red)]";
}

function barBg(avg: number) {
  if (avg >= 70) return "bg-[var(--color-loop-green)]";
  if (avg >= 60) return "bg-[var(--color-loop-gold)]";
  if (avg >= 50) return "bg-[var(--color-loop-amber)]";
  return "bg-[var(--color-loop-red)]";
}

export default function CampusPage() {
  const [stats, setStats] = useState<CampusStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campus")
      .then((response) => response.json())
      .then((data: CampusStats) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const classificationData = useMemo(
    () => [
      { name: "First", value: stats.overallBreakdown.first, color: "#f59e0b" },
      { name: "2:1", value: stats.overallBreakdown.upperSecond, color: "#22c55e" },
      { name: "2:2", value: stats.overallBreakdown.lowerSecond, color: "#f97316" },
      { name: "Third", value: stats.overallBreakdown.third, color: "#ef4444" },
      { name: "Fail", value: stats.overallBreakdown.fail, color: "#7f1d1d" },
    ],
    [stats]
  );

  const dominantClass = useMemo(
    () => classificationData.reduce((max, item) => (item.value > max.value ? item : max), classificationData[0] ?? { name: "N/A", value: 0, color: "#6b7280" }),
    [classificationData]
  );

  const sortedModules = useMemo(
    () => [...stats.moduleStats].sort((a, b) => b.avg - a.avg),
    [stats.moduleStats]
  );

  const campusAvg = useMemo(() => {
    if (stats.moduleStats.length === 0) return 0;
    return stats.moduleStats.reduce((sum, module) => sum + module.avg, 0) / stats.moduleStats.length;
  }, [stats.moduleStats]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-loop-muted)]">Loading campus stats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Campus Stats</h1>
          <p className="text-[var(--color-loop-muted)]">Live aggregated metrics built from current records.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-stagger">
          <div className="loop-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-loop-primary)]" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-loop-primary)]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[var(--color-loop-primary)]" />
              </div>
              <span className="text-sm font-medium text-[var(--color-loop-muted)]">Students</span>
            </div>
            <div className="text-4xl font-bold text-[var(--color-loop-text)]">{stats.totalStudents}</div>
          </div>

          <div className="loop-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-loop-accent)]" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-loop-accent)]/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[var(--color-loop-accent)]" />
              </div>
              <span className="text-sm font-medium text-[var(--color-loop-muted)]">Modules</span>
            </div>
            <div className="text-4xl font-bold text-[var(--color-loop-text)]">{stats.moduleStats.length}</div>
          </div>

          <div className="loop-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-loop-green)]" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-loop-green)]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--color-loop-green)]" />
              </div>
              <span className="text-sm font-medium text-[var(--color-loop-muted)]">Cohort Average</span>
            </div>
            <div className={`text-4xl font-bold ${avgColor(campusAvg)}`}>{campusAvg.toFixed(1)}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="loop-card p-6">
            <h2 className="text-lg font-semibold mb-2">Classification Breakdown</h2>
            <div className="relative">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={classificationData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                    {classificationData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(0)}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-loop-muted)]">Most Common</p>
                <p className="text-lg font-bold" style={{ color: dominantClass.color }}>{dominantClass.name}</p>
                <p className="text-xs text-[var(--color-loop-muted)]">{(dominantClass.value * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="loop-card p-6">
            <h2 className="text-lg font-semibold mb-2">Weekly Confidence Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.weeklyTrend}>
                <defs>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-loop-primary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-loop-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fill: "var(--color-loop-muted)", fontSize: 12 }} tickLine={false} />
                <YAxis domain={[40, 80]} tickFormatter={(value) => `${value}%`} tickLine={false} />
                <Tooltip formatter={(value) => [`${value}%`, "Confidence"]} />
                <ReferenceLine y={70} stroke="var(--color-loop-green)" strokeDasharray="6 4" strokeOpacity={0.4} />
                <Area type="monotone" dataKey="avgConfidence" stroke="var(--color-loop-primary)" strokeWidth={2.5} fill="url(#confidenceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Module Performance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedModules.map((mod, index) => (
              <div key={mod.code} className="loop-card p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {index < 3 && (
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                          index === 0 ? "bg-amber-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--color-loop-surface-2)] text-[var(--color-loop-muted)] shrink-0">
                      {mod.code}
                    </span>
                    <span className="font-medium text-sm truncate">{mod.name}</span>
                  </div>
                  <span className={`font-bold text-lg shrink-0 ${avgColor(mod.avg)}`}>
                    {mod.avg.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--color-loop-surface-2)] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barBg(mod.avg)}`}
                    style={{ width: `${mod.avg}%` }}
                  />
                </div>
                <div className="flex gap-4 text-xs text-[var(--color-loop-muted)]">
                  <span>{mod.students} {mod.students === 1 ? "student" : "students"}</span>
                  <span>{(mod.firstPct * 100).toFixed(0)}% firsts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
