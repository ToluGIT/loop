"use client";

import { useState } from "react";
import { PULSE_DATA } from "@/lib/mock-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MOODS = [
  { key: "confident", label: "Confident", color: "#22C55E", bg: "bg-green-500/15", text: "text-green-500" },
  { key: "okay", label: "Okay", color: "#3B82F6", bg: "bg-blue-500/15", text: "text-blue-500" },
  { key: "struggling", label: "Struggling", color: "#F59E0B", bg: "bg-amber-500/15", text: "text-amber-500" },
  { key: "overwhelmed", label: "Overwhelmed", color: "#EF4444", bg: "bg-red-500/15", text: "text-red-500" },
] as const;

type MoodKey = (typeof MOODS)[number]["key"];

function getMoodScore(moods: Record<MoodKey, number>): number {
  const total = moods.confident + moods.okay + moods.struggling + moods.overwhelmed;
  if (total === 0) return 0;
  return (moods.confident * 4 + moods.okay * 3 + moods.struggling * 2 + moods.overwhelmed * 1) / total;
}

function getMoodColor(score: number): string {
  if (score >= 3.0) return "var(--color-loop-green)";
  if (score >= 2.5) return "var(--color-loop-accent)";
  if (score >= 2.0) return "var(--color-loop-amber)";
  return "var(--color-loop-red)";
}

function getMoodLabel(score: number): string {
  if (score >= 3.0) return "Feeling good";
  if (score >= 2.5) return "Mixed feelings";
  if (score >= 2.0) return "Under pressure";
  return "Struggling";
}

const trendIcon = (trend: string) => {
  if (trend === "improving") return "↗";
  if (trend === "declining") return "↘";
  return "→";
};

const trendColor = (trend: string) => {
  if (trend === "improving") return "text-[var(--color-loop-green)]";
  if (trend === "declining") return "text-[var(--color-loop-red)]";
  return "text-[var(--color-loop-muted)]";
};

export default function PulsePage() {
  const [checkedIn, setCheckedIn] = useState<Record<string, MoodKey>>({});
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const overallMood = getMoodScore({
    confident: PULSE_DATA.modules.reduce((s, m) => s + m.moods.confident, 0),
    okay: PULSE_DATA.modules.reduce((s, m) => s + m.moods.okay, 0),
    struggling: PULSE_DATA.modules.reduce((s, m) => s + m.moods.struggling, 0),
    overwhelmed: PULSE_DATA.modules.reduce((s, m) => s + m.moods.overwhelmed, 0),
  });

  const sortedModules = [...PULSE_DATA.modules].sort(
    (a, b) => getMoodScore(a.moods) - getMoodScore(b.moods)
  );

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Stress Pulse</h1>
          <p className="text-[var(--color-loop-muted)]">
            Anonymous mood check — how&apos;s everyone really doing this week?
          </p>
        </div>

        {/* Quick check-in */}
        <div className="loop-card p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">How are you feeling?</h2>
          <p className="text-sm text-[var(--color-loop-muted)] mb-4">
            Tap a module, then your mood. 100% anonymous — helps your cohort understand shared struggles.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {PULSE_DATA.modules.map((mod) => (
              <button
                key={mod.code}
                onClick={() => setSelectedModule(selectedModule === mod.code ? null : mod.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  selectedModule === mod.code
                    ? "bg-[var(--color-loop-primary)] text-white"
                    : checkedIn[mod.code]
                      ? "bg-[var(--color-loop-green)]/15 text-[var(--color-loop-green)] border border-[var(--color-loop-green)]/30"
                      : "bg-[var(--color-loop-surface-2)] text-[var(--color-loop-muted)] hover:text-[var(--color-loop-text)]"
                }`}
              >
                {mod.code}
                {checkedIn[mod.code] && " ✓"}
              </button>
            ))}
          </div>
          {selectedModule && !checkedIn[selectedModule] && (
            <div className="flex gap-2 animate-fade-in-up">
              {MOODS.map((mood) => (
                <button
                  key={mood.key}
                  onClick={() => {
                    setCheckedIn((prev) => ({ ...prev, [selectedModule]: mood.key }));
                    setSelectedModule(null);
                  }}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer border ${mood.bg} ${mood.text} border-transparent hover:border-current`}
                >
                  {mood.label}
                </button>
              ))}
            </div>
          )}
          {selectedModule && checkedIn[selectedModule] && (
            <p className="text-sm text-[var(--color-loop-green)]">
              Thanks for checking in on {selectedModule}!
            </p>
          )}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="loop-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: getMoodColor(overallMood) }} />
            <p className="text-sm font-medium text-[var(--color-loop-muted)] mb-2">Cohort Mood</p>
            <div className="text-3xl font-bold" style={{ color: getMoodColor(overallMood) }}>
              {getMoodLabel(overallMood)}
            </div>
            <p className="text-xs text-[var(--color-loop-muted)] mt-1">
              {overallMood.toFixed(1)} / 4.0 average
            </p>
          </div>
          <div className="loop-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-loop-primary)]" />
            <p className="text-sm font-medium text-[var(--color-loop-muted)] mb-2">Responses This Week</p>
            <div className="text-3xl font-bold text-[var(--color-loop-text)]">
              {PULSE_DATA.totalResponses}
            </div>
            <p className="text-xs text-[var(--color-loop-muted)] mt-1">
              from {PULSE_DATA.totalStudents} students
            </p>
          </div>
          <div className="loop-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-loop-red)]" />
            <p className="text-sm font-medium text-[var(--color-loop-muted)] mb-2">Most Stressed</p>
            <div className="text-xl font-bold text-[var(--color-loop-red)]">
              {sortedModules[0]?.name}
            </div>
            <p className="text-xs text-[var(--color-loop-muted)] mt-1">
              {sortedModules[0] && Math.round(
                ((sortedModules[0].moods.struggling + sortedModules[0].moods.overwhelmed) /
                  sortedModules[0].responses) *
                  100
              )}% struggling or overwhelmed
            </p>
          </div>
        </div>

        {/* Mood Trend */}
        <div className="loop-card p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2">Weekly Mood Trend</h2>
          <p className="text-sm text-[var(--color-loop-muted)] mb-4">
            How the cohort has been feeling over the semester (4 = confident, 1 = overwhelmed)
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={PULSE_DATA.weeklyMood}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
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
                domain={[1, 4]}
                ticks={[1, 2, 3, 4]}
                tick={{ fill: "var(--color-loop-muted)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-loop-border)" }}
                tickLine={false}
                tickFormatter={(v) =>
                  v === 4 ? "Good" : v === 3 ? "Okay" : v === 2 ? "Low" : "Bad"
                }
              />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(1)} / 4.0`, "Mood"]}
                contentStyle={{
                  background: "var(--color-loop-surface-2)",
                  border: "1px solid var(--color-loop-border)",
                  borderRadius: "8px",
                  color: "var(--color-loop-text)",
                }}
              />
              <Area
                type="monotone"
                dataKey="avgMood"
                stroke="var(--color-loop-primary)"
                strokeWidth={2.5}
                fill="url(#moodGradient)"
                dot={{ fill: "var(--color-loop-primary)", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "var(--color-loop-primary-hover)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Module Stress Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Module Stress Map</h2>
          <p className="text-sm text-[var(--color-loop-muted)] mb-4">
            Sorted by stress level — highest stress first. You&apos;re not alone.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedModules.map((mod) => {
              const score = getMoodScore(mod.moods);
              const stressPercent = Math.round(
                ((mod.moods.struggling + mod.moods.overwhelmed) / mod.responses) * 100
              );
              return (
                <div key={mod.code} className="loop-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--color-loop-surface-2)] text-[var(--color-loop-muted)]">
                        {mod.code}
                      </span>
                      <span className="font-medium text-sm">{mod.name}</span>
                    </div>
                    <span className={`text-sm font-semibold ${trendColor(mod.trend)}`}>
                      {trendIcon(mod.trend)}
                    </span>
                  </div>
                  {/* Mood bar */}
                  <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-2">
                    {MOODS.map((mood) => {
                      const width = (mod.moods[mood.key] / mod.responses) * 100;
                      return (
                        <div
                          key={mood.key}
                          className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                          style={{ width: `${width}%`, background: mood.color }}
                          title={`${mood.label}: ${mod.moods[mood.key]} students (${Math.round(width)}%)`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--color-loop-muted)]">
                    <span>{mod.responses} responses</span>
                    <span style={{ color: getMoodColor(score) }}>
                      {stressPercent}% stressed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reassurance */}
        <div className="loop-card p-6 mt-8 text-center">
          <p className="text-lg font-semibold text-[var(--color-loop-text)] mb-2">
            You&apos;re not alone
          </p>
          <p className="text-sm text-[var(--color-loop-muted)] max-w-lg mx-auto">
            {Math.round(
              ((PULSE_DATA.modules.reduce((s, m) => s + m.moods.struggling + m.moods.overwhelmed, 0) /
                PULSE_DATA.modules.reduce((s, m) => s + m.responses, 0)) *
                100)
            )}% of students are feeling stressed this week. Reach out to peers on the{" "}
            <a href="/peers" className="text-[var(--color-loop-primary)] hover:underline">
              Peers page
            </a>{" "}
            or visit{" "}
            <a href="/spots" className="text-[var(--color-loop-primary)] hover:underline">
              Study Spots
            </a>{" "}
            to find a study group.
          </p>
        </div>
      </main>
    </div>
  );
}
