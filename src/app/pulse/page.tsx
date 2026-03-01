"use client";

import { useEffect, useMemo, useState } from "react";
import { getAnonymousClientId } from "@/lib/anonymous-client";
import { MOOD_KEYS, type MoodKey } from "@/lib/constants";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PulseModule {
  code: string;
  name: string;
  responses: number;
  moods: Record<MoodKey, number>;
  trend: "improving" | "stable" | "declining";
}

interface PulseData {
  currentWeek: string;
  totalResponses: number;
  totalStudents: number;
  modules: PulseModule[];
  weeklyMood: { week: string; avgMood: number }[];
}

const MOODS: Array<{ key: MoodKey; label: string; color: string; bg: string; text: string }> = [
  { key: "confident", label: "Confident", color: "#22C55E", bg: "bg-green-500/15", text: "text-green-500" },
  { key: "okay", label: "Okay", color: "#3B82F6", bg: "bg-blue-500/15", text: "text-blue-500" },
  { key: "struggling", label: "Struggling", color: "#F59E0B", bg: "bg-amber-500/15", text: "text-amber-500" },
  { key: "overwhelmed", label: "Overwhelmed", color: "#EF4444", bg: "bg-red-500/15", text: "text-red-500" },
];

const EMPTY_DATA: PulseData = {
  currentWeek: "W8",
  totalResponses: 0,
  totalStudents: 0,
  modules: [],
  weeklyMood: [
    { week: "W1", avgMood: 2.5 },
    { week: "W2", avgMood: 2.5 },
    { week: "W3", avgMood: 2.5 },
    { week: "W4", avgMood: 2.5 },
    { week: "W5", avgMood: 2.5 },
    { week: "W6", avgMood: 2.5 },
    { week: "W7", avgMood: 2.5 },
    { week: "W8", avgMood: 2.5 },
  ],
};

function getMoodScore(moods: Record<MoodKey, number>) {
  const total = MOOD_KEYS.reduce((sum, key) => sum + moods[key], 0);
  if (total === 0) return 0;
  return (moods.confident * 4 + moods.okay * 3 + moods.struggling * 2 + moods.overwhelmed) / total;
}

function getMoodColor(score: number) {
  if (score >= 3.0) return "var(--color-loop-green)";
  if (score >= 2.5) return "var(--color-loop-accent)";
  if (score >= 2.0) return "var(--color-loop-amber)";
  return "var(--color-loop-red)";
}

function getMoodLabel(score: number) {
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
  const [data, setData] = useState<PulseData>(EMPTY_DATA);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState<Record<string, MoodKey>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const response = await fetch("/api/pulse");
    if (!response.ok) throw new Error("Failed to fetch pulse data");
    const payload: PulseData = await response.json();
    setData(payload);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const overallMood = useMemo(() => {
    const totals = data.modules.reduce(
      (acc, mod) => ({
        confident: acc.confident + mod.moods.confident,
        okay: acc.okay + mod.moods.okay,
        struggling: acc.struggling + mod.moods.struggling,
        overwhelmed: acc.overwhelmed + mod.moods.overwhelmed,
      }),
      { confident: 0, okay: 0, struggling: 0, overwhelmed: 0 }
    );
    return getMoodScore(totals);
  }, [data.modules]);

  const sortedModules = useMemo(
    () => [...data.modules].sort((a, b) => getMoodScore(a.moods) - getMoodScore(b.moods)),
    [data.modules]
  );

  const stressedPct = useMemo(() => {
    const stressed = data.modules.reduce(
      (sum, module) => sum + module.moods.struggling + module.moods.overwhelmed,
      0
    );
    const total = data.modules.reduce((sum, module) => sum + module.responses, 0);
    return total > 0 ? Math.round((stressed / total) * 100) : 0;
  }, [data.modules]);

  const submitMood = async (moduleCode: string, moduleName: string, mood: MoodKey) => {
    setSaving(true);
    try {
      await fetch("/api/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleCode,
          moduleName,
          mood,
          clientId: getAnonymousClientId(),
        }),
      });

      setCheckedIn((prev) => ({ ...prev, [moduleCode]: mood }));
      setSelectedModule(null);
      await refresh();
    } catch {
      // ignore in demo mode
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-loop-muted)]">Loading pulse...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Stress Pulse</h1>
          <p className="text-[var(--color-loop-muted)]">
            Anonymous-style check-ins via local client IDs with aggregated reporting.
          </p>
        </div>

        <div className="loop-card p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">How are you feeling?</h2>
          <p className="text-sm text-[var(--color-loop-muted)] mb-4">
            Choose a module and mood. No personal identity is captured in this flow.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {data.modules.map((mod) => (
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
              {MOODS.map((mood) => {
                const selected = data.modules.find((mod) => mod.code === selectedModule);
                if (!selected) return null;
                return (
                  <button
                    key={mood.key}
                    disabled={saving}
                    onClick={() => submitMood(selected.code, selected.name, mood.key)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer border ${mood.bg} ${mood.text} border-transparent hover:border-current disabled:opacity-60`}
                  >
                    {mood.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="loop-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: getMoodColor(overallMood) }} />
            <p className="text-sm font-medium text-[var(--color-loop-muted)] mb-2">Cohort Mood</p>
            <div className="text-3xl font-bold" style={{ color: getMoodColor(overallMood) }}>
              {getMoodLabel(overallMood)}
            </div>
            <p className="text-xs text-[var(--color-loop-muted)] mt-1">{overallMood.toFixed(1)} / 4.0 average</p>
          </div>
          <div className="loop-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-loop-accent)]" />
            <p className="text-sm font-medium text-[var(--color-loop-muted)] mb-2">Responses</p>
            <div className="text-3xl font-bold text-[var(--color-loop-text)]">{data.totalResponses}</div>
            <p className="text-xs text-[var(--color-loop-muted)] mt-1">from {data.totalStudents} students</p>
          </div>
          <div className="loop-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-loop-amber)]" />
            <p className="text-sm font-medium text-[var(--color-loop-muted)] mb-2">Stress Index</p>
            <div className="text-3xl font-bold text-[var(--color-loop-amber)]">{stressedPct}%</div>
            <p className="text-xs text-[var(--color-loop-muted)] mt-1">struggling or overwhelmed</p>
          </div>
        </div>

        <div className="loop-card p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2">Weekly Mood Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.weeklyMood}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-loop-primary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-loop-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fill: "var(--color-loop-muted)", fontSize: 12 }} tickLine={false} />
              <YAxis domain={[1, 4]} ticks={[1, 2, 3, 4]} tickLine={false} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} / 4.0`, "Mood"]} />
              <Area type="monotone" dataKey="avgMood" stroke="var(--color-loop-primary)" strokeWidth={2.5} fill="url(#moodGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Module Stress Map</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedModules.map((mod) => {
              const score = getMoodScore(mod.moods);
              const stressPercent = mod.responses > 0
                ? Math.round(((mod.moods.struggling + mod.moods.overwhelmed) / mod.responses) * 100)
                : 0;

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

                  <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-2">
                    {MOODS.map((mood) => {
                      const width = mod.responses > 0 ? (mod.moods[mood.key] / mod.responses) * 100 : 0;
                      return (
                        <div
                          key={mood.key}
                          className="h-full first:rounded-l-full last:rounded-r-full"
                          style={{ width: `${width}%`, background: mood.color }}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--color-loop-muted)]">
                    <span>{mod.responses} responses</span>
                    <span style={{ color: getMoodColor(score) }}>{stressPercent}% stressed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
