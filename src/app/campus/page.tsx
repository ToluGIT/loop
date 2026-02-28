"use client";

import Nav from "@/components/nav";
import { CAMPUS_STATS } from "@/lib/mock-data";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CLASSIFICATION_DATA = [
  { name: "First", value: CAMPUS_STATS.overallBreakdown.first, color: "#f59e0b" },
  { name: "2:1", value: CAMPUS_STATS.overallBreakdown.upperSecond, color: "#22c55e" },
  { name: "2:2", value: CAMPUS_STATS.overallBreakdown.lowerSecond, color: "#f97316" },
  { name: "Third", value: CAMPUS_STATS.overallBreakdown.third, color: "#ef4444" },
  { name: "Fail", value: CAMPUS_STATS.overallBreakdown.fail, color: "#7f1d1d" },
];

const sortedModules = [...CAMPUS_STATS.moduleStats].sort((a, b) => b.avg - a.avg);

function avgColor(avg: number) {
  if (avg >= 65) return "text-[var(--color-loop-green)]";
  if (avg >= 55) return "text-[var(--color-loop-gold)]";
  return "text-[var(--color-loop-red)]";
}

export default function CampusPage() {
  return (
    <div className="min-h-screen">
      <Nav />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Campus Stats</h1>
          <p className="text-[var(--color-loop-muted)]">
            Anonymous, aggregated view across all computing students
          </p>
        </div>

        {/* Headline stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="loop-card p-6 text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-loop-primary)] to-[var(--color-loop-primary-hover)]">
              {CAMPUS_STATS.totalStudents}
            </div>
            <div className="text-sm text-[var(--color-loop-muted)] mt-1">Students</div>
          </div>
          <div className="loop-card p-6 text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-loop-primary)] to-[var(--color-loop-primary-hover)]">
              {CAMPUS_STATS.moduleStats.length}
            </div>
            <div className="text-sm text-[var(--color-loop-muted)] mt-1">Modules</div>
          </div>
          <div className="loop-card p-6 text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-loop-primary)] to-[var(--color-loop-primary-hover)]">
              {(
                CAMPUS_STATS.moduleStats.reduce((s, m) => s + m.avg, 0) /
                CAMPUS_STATS.moduleStats.length
              ).toFixed(1)}
              %
            </div>
            <div className="text-sm text-[var(--color-loop-muted)] mt-1">Average Grade</div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Classification Breakdown */}
          <div className="loop-card p-6">
            <h2 className="text-lg font-semibold mb-4">Classification Breakdown</h2>
            <div className="flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={CLASSIFICATION_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
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
              </div>
              <div className="w-1/2 flex flex-col gap-2">
                {CLASSIFICATION_DATA.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: entry.color }}
                    />
                    <span className="text-[var(--color-loop-muted)]">{entry.name}</span>
                    <span className="ml-auto font-medium">
                      {(entry.value * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Confidence Trend */}
          <div className="loop-card p-6">
            <h2 className="text-lg font-semibold mb-4">Weekly Confidence Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={CAMPUS_STATS.weeklyTrend}>
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
                <Line
                  type="monotone"
                  dataKey="avgConfidence"
                  stroke="var(--color-loop-primary)"
                  strokeWidth={2.5}
                  dot={{ fill: "var(--color-loop-primary)", r: 4 }}
                  activeDot={{ r: 6, fill: "var(--color-loop-primary-hover)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Module Performance Table */}
        <div className="loop-card p-6">
          <h2 className="text-lg font-semibold mb-4">Module Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-loop-border)] text-[var(--color-loop-muted)]">
                  <th className="text-left py-3 pr-4 font-medium">Code</th>
                  <th className="text-left py-3 pr-4 font-medium">Module</th>
                  <th className="text-right py-3 pr-4 font-medium">Avg Grade</th>
                  <th className="text-right py-3 pr-4 font-medium">Students</th>
                  <th className="text-right py-3 font-medium">First %</th>
                </tr>
              </thead>
              <tbody>
                {sortedModules.map((mod) => (
                  <tr
                    key={mod.code}
                    className="border-b border-[var(--color-loop-border)] last:border-0 hover:bg-[var(--color-loop-surface-2)] transition-colors"
                  >
                    <td className="py-3 pr-4 font-mono text-[var(--color-loop-muted)]">
                      {mod.code}
                    </td>
                    <td className="py-3 pr-4 font-medium">{mod.name}</td>
                    <td className={`py-3 pr-4 text-right font-semibold ${avgColor(mod.avg)}`}>
                      {mod.avg.toFixed(1)}%
                    </td>
                    <td className="py-3 pr-4 text-right text-[var(--color-loop-muted)]">
                      {mod.students}
                    </td>
                    <td className="py-3 text-right text-[var(--color-loop-muted)]">
                      {(mod.firstPct * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
