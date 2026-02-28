"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  calculateClassification,
  calculateGradeNeeded,
  getClassificationColor,
  getClassificationShort,
} from "@/lib/classification";
import type { Classification } from "@/types";
import UserSwitcher from "@/components/user-switcher";
import { Sparkles, TrendingUp, AlertTriangle, RotateCcw, Calendar } from "lucide-react";

// ============================================================
// Types
// ============================================================

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

interface UserData {
  id: string;
  name: string;
  email: string;
  course: string;
  year: number;
}

// ============================================================
// Classification Boundary Visualizer
// ============================================================

function BoundaryVisualizer({ average }: { average: number }) {
  const boundaries = [
    { label: "Fail", threshold: 0, color: "#991b1b" },
    { label: "Third", threshold: 40, color: "#ef4444" },
    { label: "2:2", threshold: 50, color: "#f97316" },
    { label: "2:1", threshold: 60, color: "#22c55e" },
    { label: "1st", threshold: 70, color: "#f59e0b" },
  ];

  const clampedAvg = Math.max(0, Math.min(100, average));
  const indicatorLeft = `${clampedAvg}%`;

  // Determine which zone the average is in for the indicator color
  let indicatorColor = "#991b1b";
  for (let i = boundaries.length - 1; i >= 0; i--) {
    if (clampedAvg >= boundaries[i].threshold) {
      indicatorColor = boundaries[i].color;
      break;
    }
  }

  return (
    <div className="w-full mt-2">
      {/* Bar */}
      <div className="relative h-8 rounded-full overflow-hidden bg-[var(--color-loop-surface-2)]">
        {/* Colored zones */}
        <div
          className="absolute inset-y-0 left-0"
          style={{ width: "40%", background: "#991b1b", opacity: 0.4 }}
        />
        <div
          className="absolute inset-y-0"
          style={{ left: "40%", width: "10%", background: "#ef4444", opacity: 0.4 }}
        />
        <div
          className="absolute inset-y-0"
          style={{ left: "50%", width: "10%", background: "#f97316", opacity: 0.4 }}
        />
        <div
          className="absolute inset-y-0"
          style={{ left: "60%", width: "10%", background: "#22c55e", opacity: 0.4 }}
        />
        <div
          className="absolute inset-y-0"
          style={{ left: "70%", width: "30%", background: "#f59e0b", opacity: 0.4 }}
        />

        {/* Boundary markers */}
        {[40, 50, 60, 70].map((b) => (
          <div
            key={b}
            className="absolute top-0 bottom-0 w-px bg-[var(--color-loop-text)]"
            style={{ left: `${b}%`, opacity: 0.5 }}
          />
        ))}

        {/* Moving indicator */}
        <div
          className="absolute top-0 bottom-0 flex items-center transition-all duration-300 ease-out"
          style={{ left: indicatorLeft }}
        >
          <div
            className="w-4 h-4 rounded-full border-2 border-white shadow-lg -ml-2"
            style={{
              background: indicatorColor,
              boxShadow: `0 0 12px ${indicatorColor}80`,
            }}
          />
        </div>
      </div>

      {/* Labels below */}
      <div className="relative h-6 mt-1 text-xs text-[var(--color-loop-muted)]">
        {boundaries.map((b) => (
          <span
            key={b.label}
            className="absolute -translate-x-1/2"
            style={{ left: `${Math.max(b.threshold, 2)}%` }}
          >
            {b.threshold > 0 ? `${b.threshold}` : "0"}
          </span>
        ))}
        <span className="absolute right-0">100</span>
      </div>
    </div>
  );
}

// ============================================================
// Module Card Component
// ============================================================

function ModuleCard({
  mod,
  sliderValues,
  onSliderChange,
  moduleAverage,
}: {
  mod: ModuleData;
  sliderValues: Record<string, number>;
  onSliderChange: (assessmentId: string, value: number) => void;
  moduleAverage: number | null;
}) {
  const levelBadgeColor = mod.level === 6
    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
    : "bg-blue-500/20 text-blue-300 border-blue-500/30";

  return (
    <div className="loop-card p-5">
      {/* Module header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-mono px-2 py-0.5 rounded border ${levelBadgeColor}`}
          >
            L{mod.level}
          </span>
          <div>
            <h3 className="font-semibold text-[var(--color-loop-text)]">
              {mod.name}
            </h3>
            <p className="text-xs text-[var(--color-loop-muted)]">
              {mod.code} &middot; {mod.credits} credits
            </p>
          </div>
        </div>
        {moduleAverage !== null && (
          <div className="text-right">
            <div className="text-lg font-bold font-mono" style={{ color: getClassificationColor(getClassFromAvg(moduleAverage)) }}>
              {moduleAverage.toFixed(1)}%
            </div>
            <div className="text-xs text-[var(--color-loop-muted)]">avg</div>
          </div>
        )}
      </div>

      {/* Assessments */}
      <div className="space-y-3">
        {mod.assessments.map((assessment) => {
          const hasGrade = assessment.grade !== null;
          const sliderVal = sliderValues[assessment.id];
          const deadlineInfo = getDeadlineInfo(assessment.dueDate);

          return (
            <div key={assessment.id} className="space-y-1">
              <div className="flex items-center gap-3">
                {/* Weight badge */}
                <span className="text-xs text-[var(--color-loop-muted)] font-mono w-10 shrink-0">
                  {(assessment.weight * 100).toFixed(0)}%
                </span>

                {/* Assessment name + deadline */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-[var(--color-loop-text)] truncate block">
                    {assessment.name}
                  </span>
                  {deadlineInfo && !hasGrade && (
                    <span className={`inline-flex items-center gap-1 text-xs mt-0.5 ${deadlineInfo.color}`}>
                      <Calendar size={10} />
                      {deadlineInfo.text}
                      {deadlineInfo.urgent && (
                        <span className="ml-1 px-1.5 py-0 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          SOON
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* Grade display or slider */}
                {hasGrade ? (
                  <span className="shrink-0 px-3 py-1 rounded-full text-sm font-mono font-semibold bg-[var(--color-loop-primary)]/20 text-[var(--color-loop-primary-hover)] border border-[var(--color-loop-primary)]/30">
                    {assessment.grade!.score}
                  </span>
                ) : (
                  <div className="flex items-center gap-2 shrink-0 w-44 sm:w-52">
                    <div className="relative flex-1 h-8 flex items-center">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={sliderVal ?? 50}
                        onChange={(e) =>
                          onSliderChange(assessment.id, Number(e.target.value))
                        }
                        className="w-full relative z-10"
                        style={{
                          background: `linear-gradient(to right, var(--color-loop-primary) 0%, var(--color-loop-primary) ${sliderVal ?? 50}%, var(--color-loop-surface-2) ${sliderVal ?? 50}%, var(--color-loop-surface-2) 100%)`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-mono font-bold text-[var(--color-loop-primary-hover)] w-10 text-right tabular-nums">
                      {sliderVal ?? 50}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function getDeadlineInfo(dueDate: string | null): { text: string; color: string; urgent: boolean } | null {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null; // past
  const dateStr = due.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  if (diffDays <= 7) return { text: `Due ${dateStr} (${diffDays}d)`, color: "text-red-400", urgent: true };
  if (diffDays <= 21) return { text: `Due ${dateStr} (${diffDays}d)`, color: "text-amber-400", urgent: false };
  return { text: `Due ${dateStr}`, color: "text-[var(--color-loop-muted)]", urgent: false };
}

function getClassFromAvg(avg: number): Classification {
  if (avg >= 70) return "First";
  if (avg >= 60) return "Upper Second (2:1)";
  if (avg >= 50) return "Lower Second (2:2)";
  if (avg >= 40) return "Third";
  return "Fail";
}

// ============================================================
// Main Simulator Page
// ============================================================

export default function SimulatorPage() {
  const [userId, setUserId] = useState("first");
  const [user, setUser] = useState<UserData | null>(null);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [badgeAnimClass, setBadgeAnimClass] = useState("");
  const prevClassRef = useRef<string>("");

  // Fetch data when userId changes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/simulator/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch simulator data");
        const data = await res.json();
        setUser(data.user);
        setModules(data.modules);

        // Initialize sliders at 50 for all ungraded assessments
        const initial: Record<string, number> = {};
        for (const mod of data.modules) {
          for (const a of mod.assessments) {
            if (!a.grade) {
              initial[a.id] = 50;
            }
          }
        }
        setSliderValues(initial);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  // Switch user handler
  const handleUserSwitch = useCallback((newUserId: string) => {
    setUserId(newUserId);
    prevClassRef.current = "";
  }, []);

  // Apply scenario preset to all ungraded assessments
  const applyPreset = useCallback(
    (value: number) => {
      setSliderValues((prev) => {
        const updated = { ...prev };
        for (const key of Object.keys(updated)) {
          updated[key] = value;
        }
        return updated;
      });
    },
    []
  );

  const handleSliderChange = useCallback(
    (assessmentId: string, value: number) => {
      setSliderValues((prev) => ({ ...prev, [assessmentId]: value }));
    },
    []
  );

  // Build the "what-if" modules by overlaying slider values onto ungraded assessments
  const whatIfModules = useMemo(() => {
    return modules.map((mod) => ({
      ...mod,
      assessments: mod.assessments.map((a) => ({
        ...a,
        grade: a.grade
          ? a.grade
          : sliderValues[a.id] !== undefined
          ? { score: sliderValues[a.id] }
          : null,
      })),
    }));
  }, [modules, sliderValues]);

  // Calculate classification from what-if data
  const result = useMemo(() => {
    if (whatIfModules.length === 0) return null;
    return calculateClassification(whatIfModules);
  }, [whatIfModules]);

  // Calculate "grade needed" targets
  const gradeNeeded = useMemo(() => {
    if (modules.length === 0) return null;

    // Use original modules (only real grades) for grade-needed calculation
    const targets: { classification: Classification; label: string; needed: number | null }[] = [
      { classification: "First", label: "First", needed: calculateGradeNeeded(modules, "First") },
      { classification: "Upper Second (2:1)", label: "2:1", needed: calculateGradeNeeded(modules, "Upper Second (2:1)") },
    ];
    return targets;
  }, [modules]);

  // Per-module averages from what-if data
  const moduleAverages = useMemo(() => {
    const avgs: Record<string, number | null> = {};
    for (const mod of whatIfModules) {
      const graded = mod.assessments.filter((a) => a.grade?.score != null);
      if (graded.length === 0) {
        avgs[mod.id] = null;
        continue;
      }
      const totalWeight = graded.reduce((s, a) => s + a.weight, 0);
      if (totalWeight === 0) {
        avgs[mod.id] = null;
        continue;
      }
      const weightedSum = graded.reduce(
        (s, a) => s + a.grade!.score * a.weight,
        0
      );
      avgs[mod.id] = weightedSum / totalWeight;
    }
    return avgs;
  }, [whatIfModules]);

  // Animate badge on classification change
  useEffect(() => {
    if (!result) return;
    const currentClass = result.classification;
    if (prevClassRef.current && prevClassRef.current !== currentClass) {
      setBadgeAnimClass("changed");
      const timer = setTimeout(() => setBadgeAnimClass(""), 600);
      return () => clearTimeout(timer);
    }
    prevClassRef.current = currentClass;
  }, [result]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[var(--color-loop-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[var(--color-loop-muted)]">Loading simulator...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loop-card p-8 text-center max-w-md">
          <p className="text-red-400 text-lg font-semibold mb-2">Error</p>
          <p className="text-[var(--color-loop-muted)]">{error}</p>
        </div>
      </div>
    );
  }

  if (!result || !user) return null;

  const classColor = getClassificationColor(result.classification as Classification);
  const classShort = getClassificationShort(result.classification as Classification);

  // Use ORIGINAL modules for rendering (so null grades show sliders)
  // whatIfModules is only for classification calculation
  const level5Modules = modules.filter((m) => m.level === 5);
  const level6Modules = modules.filter((m) => m.level === 6);

  return (
    <div className="min-h-screen pb-20 animate-fade-in-up">
      {/* User context bar */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-loop-muted)]">What-If Simulator</span>
        </div>
        <UserSwitcher currentUserId={user.id} onSwitch={handleUserSwitch} />
      </div>

      <main className="max-w-5xl mx-auto px-4 mt-4 space-y-8">
        {/* Hero Classification Section */}
        <section className="text-center space-y-6">
          {/* Animated Classification Badge */}
          <div
            className={`classification-badge ${badgeAnimClass} inline-flex flex-col items-center justify-center w-40 h-40 rounded-full border-4 mx-auto`}
            style={{
              borderColor: classColor,
              background: `${classColor}15`,
              boxShadow: `0 0 40px ${classColor}30, 0 0 80px ${classColor}10`,
            }}
          >
            <span
              className="text-4xl font-black tracking-tight"
              style={{ color: classColor }}
            >
              {classShort}
            </span>
            <span className="text-xs text-[var(--color-loop-muted)] mt-1">
              {result.classification !== "Insufficient Data" ? result.classification : "No Data"}
            </span>
          </div>

          {/* Weighted Average */}
          <div>
            <p className="text-6xl font-black font-mono tracking-tighter" style={{ color: classColor }}>
              {result.weightedAverage.toFixed(1)}
              <span className="text-2xl text-[var(--color-loop-muted)] font-normal">%</span>
            </p>
            <p className="text-sm text-[var(--color-loop-muted)] mt-1">
              Projected Weighted Average
            </p>
          </div>

          {/* Level Averages */}
          <div className="flex items-center justify-center gap-8 text-sm">
            {result.level5Average !== null && (
              <div className="text-center">
                <p className="text-lg font-bold font-mono text-blue-300">
                  {result.level5Average.toFixed(1)}%
                </p>
                <p className="text-xs text-[var(--color-loop-muted)]">Level 5 (1/3 weight)</p>
              </div>
            )}
            {result.level6Average !== null && (
              <div className="text-center">
                <p className="text-lg font-bold font-mono text-purple-300">
                  {result.level6Average.toFixed(1)}%
                </p>
                <p className="text-xs text-[var(--color-loop-muted)]">Level 6 (2/3 weight)</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-lg font-bold font-mono text-[var(--color-loop-text)]">
                {Math.round(result.confidence * 100)}%
              </p>
              <p className="text-xs text-[var(--color-loop-muted)]">Data Confidence</p>
            </div>
          </div>

          {/* Boundary Visualizer */}
          <div className="max-w-2xl mx-auto">
            <BoundaryVisualizer average={result.weightedAverage} />
          </div>

          {/* Grade Needed Targets */}
          {gradeNeeded && gradeNeeded.some((g) => g.needed !== null) && (
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              {gradeNeeded.map(
                (target) =>
                  target.needed !== null && (
                    <div
                      key={target.label}
                      className="loop-card px-4 py-3 text-center"
                    >
                      <p className="text-xs text-[var(--color-loop-muted)] mb-1">
                        To achieve a{" "}
                        <span
                          className="font-semibold"
                          style={{
                            color: getClassificationColor(target.classification),
                          }}
                        >
                          {target.label}
                        </span>
                      </p>
                      <p className="text-xl font-bold font-mono text-[var(--color-loop-text)]">
                        {target.needed.toFixed(1)}%
                        <span className="text-xs font-normal text-[var(--color-loop-muted)] ml-1">
                          avg needed
                        </span>
                      </p>
                    </div>
                  )
              )}
            </div>
          )}
        </section>

        {/* Scenario Presets */}
        <div className="text-center space-y-3">
          <p className="text-sm text-[var(--color-loop-muted)]">
            Quick scenarios &mdash; or drag sliders below for fine control
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => applyPreset(100)}
              className="loop-btn flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-loop-surface)] border border-[var(--color-loop-border)] hover:border-[var(--color-loop-green)] hover:bg-[var(--color-loop-green)]/10 hover:shadow-[0_0_16px_rgba(34,197,94,0.15)] text-sm text-[var(--color-loop-text)] transition-all"
            >
              <Sparkles size={14} className="text-[var(--color-loop-green)]" />
              Ace Everything
            </button>
            <button
              onClick={() => applyPreset(75)}
              className="loop-btn flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-loop-surface)] border border-[var(--color-loop-border)] hover:border-blue-400 hover:bg-blue-400/10 hover:shadow-[0_0_16px_rgba(96,165,250,0.15)] text-sm text-[var(--color-loop-text)] transition-all"
            >
              <TrendingUp size={14} className="text-blue-400" />
              Strong Pass
            </button>
            <button
              onClick={() => applyPreset(42)}
              className="loop-btn flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-loop-surface)] border border-[var(--color-loop-border)] hover:border-[var(--color-loop-amber)] hover:bg-[var(--color-loop-amber)]/10 hover:shadow-[0_0_16px_rgba(249,115,22,0.15)] text-sm text-[var(--color-loop-text)] transition-all"
            >
              <AlertTriangle size={14} className="text-[var(--color-loop-amber)]" />
              Barely Pass
            </button>
            <button
              onClick={() => applyPreset(50)}
              className="loop-btn flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-loop-surface)] border border-[var(--color-loop-border)] hover:border-[var(--color-loop-muted)] hover:bg-[var(--color-loop-surface-2)] text-sm text-[var(--color-loop-muted)] transition-all"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>

        {/* Module Cards */}
        {level5Modules.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
              Level 5 Modules
              <span className="text-xs text-[var(--color-loop-muted)] font-normal">(1/3 weight)</span>
            </h2>
            <div className="grid gap-4">
              {level5Modules.map((mod) => (
                <ModuleCard
                  key={mod.id}
                  mod={mod}
                  sliderValues={sliderValues}
                  onSliderChange={handleSliderChange}
                  moduleAverage={moduleAverages[mod.id]}
                />
              ))}
            </div>
          </section>
        )}

        {level6Modules.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-purple-500" />
              Level 6 Modules
              <span className="text-xs text-[var(--color-loop-muted)] font-normal">(2/3 weight)</span>
            </h2>
            <div className="grid gap-4">
              {level6Modules.map((mod) => (
                <ModuleCard
                  key={mod.id}
                  mod={mod}
                  sliderValues={sliderValues}
                  onSliderChange={handleSliderChange}
                  moduleAverage={moduleAverages[mod.id]}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
