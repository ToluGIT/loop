"use client";

import { useState, useEffect } from "react";
import { CAMPUS_STATS } from "@/lib/mock-data";
import {
  calculateClassification,
  calculateModuleAverage,
  getClassificationShort,
  getClassificationColor,
} from "@/lib/classification";
import { Share2, ChevronDown } from "lucide-react";

interface ModuleData {
  id: string;
  code: string;
  name: string;
  credits: number;
  level: number;
  assessments: {
    id: string;
    name: string;
    weight: number;
    grade?: { score: number } | null;
  }[];
}

interface WrappedStats {
  name: string;
  classification: string;
  classificationShort: string;
  classificationColor: string;
  weightedAverage: number;
  confidence: number;
  bestModule: { code: string; name: string; average: number } | null;
  toughestModule: { code: string; name: string; average: number } | null;
  creditsCompleted: number;
  totalCredits: number;
  level5Avg: number | null;
  level6Avg: number | null;
  percentile: number;
  gradedAssessments: number;
  totalAssessments: number;
}

function computeWrappedStats(
  user: { name: string },
  modules: ModuleData[]
): WrappedStats {
  const result = calculateClassification(modules);

  // Find best and toughest modules
  const moduleAverages = modules
    .map((m) => {
      const avg = calculateModuleAverage(m);
      return avg ? { code: m.code, name: m.name, average: Math.round(avg.average * 10) / 10 } : null;
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  const sorted = [...moduleAverages].sort((a, b) => b.average - a.average);
  const bestModule = sorted[0] || null;
  const toughestModule = sorted.length > 1 ? sorted[sorted.length - 1] : null;

  // Percentile from campus data
  const avg = result.weightedAverage;
  let percentile = 95;
  if (avg < 40) percentile = 5;
  else if (avg < 50) percentile = 15;
  else if (avg < 55) percentile = 30;
  else if (avg < 60) percentile = 45;
  else if (avg < 65) percentile = 60;
  else if (avg < 70) percentile = 75;
  else if (avg < 80) percentile = 90;

  // Count graded assessments
  let gradedAssessments = 0;
  let totalAssessments = 0;
  for (const m of modules) {
    for (const a of m.assessments) {
      totalAssessments++;
      if (a.grade?.score != null) gradedAssessments++;
    }
  }

  return {
    name: user.name,
    classification: result.classification,
    classificationShort: getClassificationShort(result.classification),
    classificationColor: getClassificationColor(result.classification),
    weightedAverage: result.weightedAverage,
    confidence: result.confidence,
    bestModule,
    toughestModule,
    creditsCompleted: result.creditsCompleted,
    totalCredits: result.totalCredits,
    level5Avg: result.level5Average,
    level6Avg: result.level6Average,
    percentile,
    gradedAssessments,
    totalAssessments,
  };
}

const CARD_GRADIENTS = [
  "from-[#F97354] to-[#FF8A6E]",
  "from-[#3B82F6] to-[#60A5FA]",
  "from-[#22C55E] to-[#34D399]",
  "from-[#F59E0B] to-[#FBBF24]",
  "from-[#8B5CF6] to-[#A78BFA]",
  "from-[#EC4899] to-[#F472B6]",
  "from-[#F97354] to-[#8B5CF6]",
];

export default function WrappedPage() {
  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/simulator/first")
      .then((r) => r.json())
      .then((data) => {
        setStats(computeWrappedStats(data.user, data.modules));
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-loop-muted)]">Loading your story...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="snap-y snap-mandatory h-screen overflow-y-auto">
        {/* Card 1: Title */}
        <section className={`snap-start h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br ${CARD_GRADIENTS[0]} relative`}>
          <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-4">
            Your Degree Story
          </p>
          <h1 className="text-5xl sm:text-7xl font-black text-white text-center leading-tight">
            {stats.name.split(" ")[0]}&apos;s
            <br />
            Year in Review
          </h1>
          <p className="text-white/60 text-lg mt-6">
            {stats.gradedAssessments} of {stats.totalAssessments} assessments graded
          </p>
          <div className="absolute bottom-12 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/50" />
          </div>
        </section>

        {/* Card 2: Classification */}
        <section className={`snap-start h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br ${CARD_GRADIENTS[1]}`}>
          <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-6">
            You&apos;re on track for
          </p>
          <div
            className="text-8xl sm:text-9xl font-black text-white"
            style={{ textShadow: "0 4px 30px rgba(0,0,0,0.2)" }}
          >
            {stats.classificationShort}
          </div>
          <p className="text-white/80 text-2xl font-semibold mt-4">
            {stats.weightedAverage}% weighted average
          </p>
          <p className="text-white/50 text-sm mt-2">
            {Math.round(stats.confidence * 100)}% of grades in
          </p>
        </section>

        {/* Card 3: Best Module */}
        {stats.bestModule && (
          <section className={`snap-start h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br ${CARD_GRADIENTS[2]}`}>
            <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-6">
              Your strongest module
            </p>
            <div className="text-6xl sm:text-8xl font-black text-white mb-4">
              {stats.bestModule.average}%
            </div>
            <p className="text-white/90 text-xl font-semibold text-center">
              {stats.bestModule.name}
            </p>
            <p className="text-white/50 text-sm font-mono mt-2">
              {stats.bestModule.code}
            </p>
          </section>
        )}

        {/* Card 4: Toughest Module */}
        {stats.toughestModule && (
          <section className={`snap-start h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br ${CARD_GRADIENTS[3]}`}>
            <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-6">
              Your biggest challenge
            </p>
            <div className="text-6xl sm:text-8xl font-black text-white mb-4">
              {stats.toughestModule.average}%
            </div>
            <p className="text-white/90 text-xl font-semibold text-center">
              {stats.toughestModule.name}
            </p>
            <p className="text-white/50 text-sm mt-3">
              Every expert was once a beginner
            </p>
          </section>
        )}

        {/* Card 5: Cohort Rank */}
        <section className={`snap-start h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br ${CARD_GRADIENTS[4]}`}>
          <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-6">
            Among {CAMPUS_STATS.totalStudents} students
          </p>
          <div className="text-7xl sm:text-9xl font-black text-white">
            Top {100 - stats.percentile}%
          </div>
          <p className="text-white/60 text-lg mt-4">
            of your cohort
          </p>
        </section>

        {/* Card 6: Level Growth */}
        {stats.level5Avg !== null && stats.level6Avg !== null && (
          <section className={`snap-start h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br ${CARD_GRADIENTS[5]}`}>
            <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-8">
              Your growth
            </p>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl sm:text-6xl font-black text-white/60">
                  {stats.level5Avg}%
                </div>
                <p className="text-white/40 text-sm mt-2">3rd Year</p>
              </div>
              <div className="text-4xl text-white/40">&rarr;</div>
              <div className="text-center">
                <div className="text-5xl sm:text-6xl font-black text-white">
                  {stats.level6Avg}%
                </div>
                <p className="text-white/70 text-sm mt-2">4th Year</p>
              </div>
            </div>
            {stats.level6Avg > stats.level5Avg ? (
              <p className="text-white/60 text-lg mt-8">
                +{(stats.level6Avg - stats.level5Avg).toFixed(1)}% improvement
              </p>
            ) : (
              <p className="text-white/60 text-lg mt-8">
                Consistent across both years
              </p>
            )}
          </section>
        )}

        {/* Card 7: Credits + CTA */}
        <section className={`snap-start h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br ${CARD_GRADIENTS[6]}`}>
          <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-6">
            Credits earned
          </p>
          <div className="text-7xl sm:text-8xl font-black text-white mb-2">
            {stats.creditsCompleted}
            <span className="text-4xl text-white/50">/{stats.totalCredits}</span>
          </div>
          <p className="text-white/60 text-lg mb-12">
            {Math.round((stats.creditsCompleted / stats.totalCredits) * 100)}% of your degree
          </p>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "My Degree Wrapped - Loop",
                  text: `I'm on track for a ${stats.classificationShort} with ${stats.weightedAverage}% average! Check your degree story on Loop.`,
                });
              }
            }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-semibold text-lg transition-all backdrop-blur-sm border border-white/20"
          >
            <Share2 size={20} />
            Share Your Story
          </button>
        </section>
      </div>
    </div>
  );
}
