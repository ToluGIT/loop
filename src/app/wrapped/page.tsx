"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CAMPUS_STATS } from "@/lib/mock-data";
import {
  calculateClassification,
  calculateModuleAverage,
  getClassificationShort,
  getClassificationColor,
} from "@/lib/classification";
import { Share2, ChevronDown, Download, X } from "lucide-react";
import html2canvas from "html2canvas";

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

function TwitterIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export default function WrappedPage() {
  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const storyCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/simulator/first")
      .then((r) => r.json())
      .then((data) => {
        setStats(computeWrappedStats(data.user, data.modules));
        setLoading(false);
      });
  }, []);

  const generateStoryImage = useCallback(async (): Promise<Blob | null> => {
    if (!storyCardRef.current) return null;
    setGenerating(true);
    try {
      const canvas = await html2canvas(storyCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: storyCardRef.current.offsetWidth,
        height: storyCardRef.current.offsetHeight,
      });
      return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    } finally {
      setGenerating(false);
    }
  }, []);

  const shareToTwitter = useCallback(() => {
    if (!stats) return;
    const text = `I'm on track for a ${stats.classificationShort} with ${stats.weightedAverage}% average! ${stats.bestModule ? `Best module: ${stats.bestModule.name} (${stats.bestModule.average}%)` : ""}\n\nCheck your degree story on Loop #DegreeWrapped #RGUHacks`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=550,height=420");
    setShareOpen(false);
  }, [stats]);

  const shareToInstagram = useCallback(async () => {
    if (!stats) return;
    const blob = await generateStoryImage();
    if (!blob) return;

    // Try native share with file (works on mobile, opens Instagram directly)
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], "degree-wrapped.png", { type: "image/png" });
      const shareData = { files: [file], title: "My Degree Wrapped" };
      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          setShareOpen(false);
          return;
        } catch {
          // User cancelled or error — fall through to download
        }
      }
    }

    // Fallback: download the image
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "degree-wrapped.png";
    a.click();
    URL.revokeObjectURL(url);
    setShareOpen(false);
  }, [stats, generateStoryImage]);

  const downloadImage = useCallback(async () => {
    const blob = await generateStoryImage();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "degree-wrapped.png";
    a.click();
    URL.revokeObjectURL(url);
    setShareOpen(false);
  }, [generateStoryImage]);

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

        {/* Card 7: Credits + Share */}
        <section className={`snap-start h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br ${CARD_GRADIENTS[6]} relative`}>
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
            onClick={() => setShareOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-semibold text-lg transition-all backdrop-blur-sm border border-white/20 cursor-pointer"
          >
            <Share2 size={20} />
            Share Your Story
          </button>

          {/* Share Modal */}
          {shareOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in-up">
              <div
                className="w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-2xl p-6"
                style={{ background: "var(--color-loop-surface, #1A1A22)" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold" style={{ color: "var(--color-loop-text, #F0F0F5)" }}>
                    Share your Wrapped
                  </h3>
                  <button
                    onClick={() => setShareOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    style={{ color: "var(--color-loop-muted, #8E90A6)" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {/* Twitter / X */}
                  <button
                    onClick={shareToTwitter}
                    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left transition-all cursor-pointer hover:scale-[1.02]"
                    style={{ background: "#000", color: "#fff" }}
                  >
                    <TwitterIcon size={20} />
                    <div>
                      <div className="font-semibold text-sm">Post on X</div>
                      <div className="text-xs text-white/50">Share your stats as a tweet</div>
                    </div>
                  </button>

                  {/* Instagram */}
                  <button
                    onClick={shareToInstagram}
                    disabled={generating}
                    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-60"
                    style={{
                      background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)",
                      color: "#fff",
                    }}
                  >
                    <InstagramIcon size={20} />
                    <div>
                      <div className="font-semibold text-sm">
                        {generating ? "Generating..." : "Share to Instagram"}
                      </div>
                      <div className="text-xs text-white/70">Save story card image</div>
                    </div>
                  </button>

                  {/* Download Image */}
                  <button
                    onClick={downloadImage}
                    disabled={generating}
                    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-60"
                    style={{
                      background: "var(--color-loop-surface-2, #232330)",
                      color: "var(--color-loop-text, #F0F0F5)",
                    }}
                  >
                    <Download size={20} />
                    <div>
                      <div className="font-semibold text-sm">
                        {generating ? "Generating..." : "Save Image"}
                      </div>
                      <div className="text-xs" style={{ color: "var(--color-loop-muted, #8E90A6)" }}>
                        Download as PNG for any platform
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Hidden story card for screenshot capture */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
        <div
          ref={storyCardRef}
          style={{
            width: 1080,
            height: 1920,
            background: "linear-gradient(135deg, #F97354, #8B5CF6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 80,
            fontFamily: "Outfit, sans-serif",
            position: "relative",
          }}
        >
          {/* Loop branding */}
          <div style={{ position: "absolute", top: 60, left: 80, fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.6)" }}>
            Loop
          </div>
          <div style={{ position: "absolute", top: 60, right: 80, fontSize: 16, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
            #DegreeWrapped
          </div>

          {/* Name */}
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 24, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", marginBottom: 40 }}>
            {stats.name.split(" ")[0]}&apos;s Year
          </p>

          {/* Classification */}
          <div style={{ fontSize: 180, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 8px 40px rgba(0,0,0,0.2)", marginBottom: 20 }}>
            {stats.classificationShort}
          </div>
          <p style={{ fontSize: 36, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 60 }}>
            {stats.weightedAverage}% weighted average
          </p>

          {/* Stats grid */}
          <div style={{ display: "flex", gap: 40, marginBottom: 60 }}>
            {stats.bestModule && (
              <div style={{ textAlign: "center", padding: "24px 40px", background: "rgba(255,255,255,0.15)", borderRadius: 20, backdropFilter: "blur(10px)" }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: "#fff" }}>{stats.bestModule.average}%</div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Best Module</div>
              </div>
            )}
            <div style={{ textAlign: "center", padding: "24px 40px", background: "rgba(255,255,255,0.15)", borderRadius: 20, backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: "#fff" }}>Top {100 - stats.percentile}%</div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>of cohort</div>
            </div>
          </div>

          {/* Credits */}
          <p style={{ fontSize: 22, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
            {stats.creditsCompleted}/{stats.totalCredits} credits earned
          </p>

          {/* Footer */}
          <div style={{ position: "absolute", bottom: 60, fontSize: 16, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
            made with Loop &middot; RGU Hacks 2026
          </div>
        </div>
      </div>
    </div>
  );
}
