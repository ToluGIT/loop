"use client";

import { CAMPUS_STATS } from "@/lib/mock-data";
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

const CLASSIFICATION_DATA = [
  { name: "First", value: CAMPUS_STATS.overallBreakdown.first, color: "#f59e0b" },
  { name: "2:1", value: CAMPUS_STATS.overallBreakdown.upperSecond, color: "#22c55e" },
  { name: "2:2", value: CAMPUS_STATS.overallBreakdown.lowerSecond, color: "#f97316" },
  { name: "Third", value: CAMPUS_STATS.overallBreakdown.third, color: "#ef4444" },
  { name: "Fail", value: CAMPUS_STATS.overallBreakdown.fail, color: "#7f1d1d" },
];

const dominantClass = CLASSIFICATION_DATA.reduce((max, item) =>
  item.value > max.value ? item : max
);

const sortedModules = [...CAMPUS_STATS.moduleStats].sort((a, b) => b.avg - a.avg);

const campusAvg =
  CAMPUS_STATS.moduleStats.reduce((s, m) => s + m.avg, 0) /
  CAMPUS_STATS.moduleStats.length;

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
  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Campus Stats</h1>
          <p className="text-[var(--color-loop-muted)]">
            How your cohort is doing — anonymous, aggregated data across all computing students
          </p>
        </div>

        {/* Headline stats — accent-topped cards with icons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-stagger">
          {/* Students */}
          <div className="loop-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-loop-primary)]" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-loop-primary)]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[var(--color-loop-primary)]" />
              </div>
              <span className="text-sm font-medium text-[var(--color-loop-muted)]">Students</span>
            </div>
            <div className="text-4xl font-bold text-[var(--color-loop-text)]">
              {CAMPUS_STATS.totalStudents}
            </div>
          </div>

          {/* Modules */}
          <div className="loop-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-loop-accent)]" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-loop-accent)]/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[var(--color-loop-accent)]" />
              </div>
              <span className="text-sm font-medium text-[var(--color-loop-muted)]">Modules</span>
            </div>
            <div className="text-4xl font-bold text-[var(--color-loop-text)]">
              {CAMPUS_STATS.moduleStats.length}
            </div>
          </div>

          {/* Average Grade */}
          <div className="loop-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-loop-green)]" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-loop-green)]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--color-loop-green)]" />
              </div>
              <span className="text-sm font-medium text-[var(--color-loop-muted)]">Cohort Average</span>
            </div>
            <div className={`text-4xl font-bold ${avgColor(campusAvg)}`}>
              {campusAvg.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Classification — Enhanced Donut with Center Label */}
          <div className="loop-card p-6">
            <h2 className="text-lg font-semibold mb-2">Classification Breakdown</h2>
            <div className="relative">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={CLASSIFICATION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {CLASSIFICATION_DATA.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${(Number(value) * 100).toFixed(0)}%`}
                    contentStyle={{
                      background: "var(--color-loop-surface-2)",
                      border: "1px solid var(--color-loop-border)",
                      borderRadius: "8px",
                      color: "var(--color-loop-text)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-3xl font-black" style={{ color: dominantClass.color }}>
                    {dominantClass.name}
                  </div>
                  <div className="text-xs text-[var(--color-loop-muted)]">most common</div>
                </div>
              </div>
            </div>
            {/* Horizontal legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
              {CLASSIFICATION_DATA.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-sm">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: entry.color }}
                  />
                  <span className="text-[var(--color-loop-muted)]">{entry.name}</span>
                  <span className="font-medium">{(entry.value * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence Trend — Area Chart with Gradient Fill */}
          <div className="loop-card p-6">
            <h2 className="text-lg font-semibold mb-2">Weekly Confidence Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={CAMPUS_STATS.weeklyTrend}>
                <defs>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-loop-primary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-loop-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  tick={{ fill: "var(--color-loop-muted)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--color-loop-border)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[40, 80]}
                  tick={{ fill: "var(--color-loop-muted)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--color-loop-border)" }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Confidence"]}
                  contentStyle={{
                    background: "var(--color-loop-surface-2)",
                    border: "1px solid var(--color-loop-border)",
                    borderRadius: "8px",
                    color: "var(--color-loop-text)",
                  }}
                />
                <ReferenceLine
                  y={70}
                  stroke="var(--color-loop-green)"
                  strokeDasharray="6 4"
                  strokeOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="avgConfidence"
                  stroke="var(--color-loop-primary)"
                  strokeWidth={2.5}
                  fill="url(#confidenceGradient)"
                  dot={{ fill: "var(--color-loop-primary)", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "var(--color-loop-primary-hover)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Module Performance — Card Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Module Performance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedModules.map((mod, i) => (
              <div key={mod.code} className="loop-card p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {i < 3 && (
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                          i === 0
                            ? "bg-amber-500"
                            : i === 1
                              ? "bg-gray-400"
                              : "bg-amber-700"
                        }`}
                      >
                        {i + 1}
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
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-[var(--color-loop-surface-2)] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barBg(mod.avg)}`}
                    style={{ width: `${mod.avg}%` }}
                  />
                </div>
                {/* Stats */}
                <div className="flex gap-4 text-xs text-[var(--color-loop-muted)]">
                  <span>{mod.students} students</span>
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
