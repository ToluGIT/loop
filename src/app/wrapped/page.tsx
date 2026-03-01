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

  const moduleAverages = modules
    .map((m) => {
      const avg = calculateModuleAverage(m);
      return avg ? { code: m.code, name: m.name, average: Math.round(avg.average * 10) / 10 } : null;
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  const sorted = [...moduleAverages].sort((a, b) => b.average - a.average);
  const bestModule = sorted[0] || null;
  const toughestModule = sorted.length > 1 ? sorted[sorted.length - 1] : null;

  const avg = result.weightedAverage;
  let percentile = 95;
  if (avg < 40) percentile = 5;
  else if (avg < 50) percentile = 15;
  else if (avg < 55) percentile = 30;
  else if (avg < 60) percentile = 45;
  else if (avg < 65) percentile = 60;
  else if (avg < 70) percentile = 75;
  else if (avg < 80) percentile = 90;

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

/* ─── Gradient configs per card ─── */
const CARDS = [
  { bg: "linear-gradient(135deg, #F97354 0%, #FF6B8A 50%, #FF8A6E 100%)" },
  { bg: "linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)" },
  { bg: "linear-gradient(135deg, #059669 0%, #22C55E 50%, #34D399 100%)" },
  { bg: "linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #FBBF24 100%)" },
  { bg: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)" },
  { bg: "linear-gradient(135deg, #DB2777 0%, #EC4899 50%, #F472B6 100%)" },
  { bg: "linear-gradient(135deg, #F97354 0%, #A855F7 50%, #8B5CF6 100%)" },
];

/* ─── Floating shapes per card ─── */
function FloatingShapes({ seed }: { seed: number }) {
  const shapes = Array.from({ length: 6 }, (_, i) => {
    const s = seed * 7 + i * 13;
    const size = 40 + (s % 120);
    const x = (s * 17) % 100;
    const y = (s * 23) % 100;
    const delay = (i * 1.2);
    const duration = 12 + (s % 10);
    const opacity = 0.06 + (i % 3) * 0.03;
    const isCircle = i % 3 !== 2;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          borderRadius: isCircle ? "50%" : "24%",
          background: "rgba(255,255,255," + opacity + ")",
          animation: `${i % 2 === 0 ? "wrapped-float" : "wrapped-float-slow"} ${duration}s ease-in-out ${delay}s infinite`,
          pointerEvents: "none" as const,
          zIndex: 0,
        }}
      />
    );
  });
  return <>{shapes}</>;
}

/* ─── Count-up hook ─── */
function useCountUp(target: number, isVisible: boolean, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isVisible) { setValue(0); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target * 10) / 10);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, isVisible, duration]);

  return value;
}

/* ─── IntersectionObserver hook ─── */
function useInView(threshold = 0.5) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); else setInView(false); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ─── Progress dots ─── */
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="transition-all duration-300"
          style={{
            width: i === current ? 10 : 6,
            height: i === current ? 10 : 6,
            borderRadius: "50%",
            background: i === current ? "#fff" : "rgba(255,255,255,0.3)",
            boxShadow: i === current ? "0 0 8px rgba(255,255,255,0.5)" : "none",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Social icons ─── */
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

/* ─── Wrapped card wrapper ─── */
function WrappedCard({
  index,
  gradient,
  onVisible,
  children,
}: {
  index: number;
  gradient: string;
  onVisible: (i: number) => void;
  children: React.ReactNode;
}) {
  const { ref, inView } = useInView(0.6);

  useEffect(() => {
    if (inView) onVisible(index);
  }, [inView, index, onVisible]);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`snap-start h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden wrapped-grain ${inView ? "wrapped-visible" : ""}`}
      style={{ background: gradient }}
    >
      <FloatingShapes seed={index} />
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </section>
  );
}

/* ─── Number display with count-up ─── */
function CountUpNumber({
  value,
  isVisible,
  suffix = "",
  prefix = "",
  decimals = 1,
  className = "",
  style,
}: {
  value: number;
  isVisible: boolean;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const animated = useCountUp(value, isVisible);
  return (
    <span className={className} style={style}>
      {prefix}{decimals > 0 ? animated.toFixed(decimals) : Math.round(animated)}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function WrappedPage() {
  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const storyCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/simulator/first")
      .then((r) => r.json())
      .then((data) => {
        setStats(computeWrappedStats(data.user, data.modules));
        setLoading(false);
      });
  }, []);

  const handleCardVisible = useCallback((i: number) => setActiveCard(i), []);

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
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], "degree-wrapped.png", { type: "image/png" });
      const shareData = { files: [file], title: "My Degree Wrapped" };
      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          setShareOpen(false);
          return;
        } catch { /* cancelled */ }
      }
    }
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

  // Build card list (some cards are conditional)
  const cardConfigs: { key: string; el: (visible: boolean) => React.ReactNode }[] = [
    {
      key: "title",
      el: (visible) => (
        <>
          <p className="wrapped-anim-1 text-white/70 text-sm font-medium uppercase tracking-[0.3em] mb-4">
            Your Degree Story
          </p>
          <h1 className="wrapped-anim-2 text-5xl sm:text-7xl font-black text-white text-center leading-tight">
            {stats.name.split(" ")[0]}&apos;s
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
              Year in Review
            </span>
          </h1>
          <p className="wrapped-anim-3 text-white/60 text-lg mt-6">
            {visible ? stats.gradedAssessments : 0} of {stats.totalAssessments} assessments graded
          </p>
          <div className="wrapped-anim-4 absolute bottom-12 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/50" />
          </div>
        </>
      ),
    },
    {
      key: "classification",
      el: (visible) => (
        <>
          <p className="wrapped-anim-1 text-white/70 text-sm font-medium uppercase tracking-[0.3em] mb-6">
            You&apos;re on track for
          </p>
          <div
            className="wrapped-anim-2 text-8xl sm:text-9xl font-black text-white"
            style={{ textShadow: "0 4px 30px rgba(0,0,0,0.2)" }}
          >
            {stats.classificationShort}
          </div>
          <p className="wrapped-anim-3 text-white/80 text-2xl font-semibold mt-4">
            <CountUpNumber value={stats.weightedAverage} isVisible={visible} />% weighted average
          </p>
          <p className="wrapped-anim-4 text-white/50 text-sm mt-2">
            {Math.round(stats.confidence * 100)}% of grades in
          </p>
        </>
      ),
    },
  ];

  if (stats.bestModule) {
    cardConfigs.push({
      key: "best",
      el: (visible) => (
        <>
          <p className="wrapped-anim-1 text-white/70 text-sm font-medium uppercase tracking-[0.3em] mb-6">
            Your strongest module
          </p>
          <div className="wrapped-anim-2 text-6xl sm:text-8xl font-black text-white mb-4">
            <CountUpNumber value={stats.bestModule!.average} isVisible={visible} />%
          </div>
          <p className="wrapped-anim-3 text-white/90 text-xl font-semibold text-center">
            {stats.bestModule!.name}
          </p>
          <p className="wrapped-anim-4 text-white/50 text-sm font-mono mt-2">
            {stats.bestModule!.code}
          </p>
        </>
      ),
    });
  }

  if (stats.toughestModule) {
    cardConfigs.push({
      key: "tough",
      el: (visible) => (
        <>
          <p className="wrapped-anim-1 text-white/70 text-sm font-medium uppercase tracking-[0.3em] mb-6">
            Your biggest challenge
          </p>
          <div className="wrapped-anim-2 text-6xl sm:text-8xl font-black text-white mb-4">
            <CountUpNumber value={stats.toughestModule!.average} isVisible={visible} />%
          </div>
          <p className="wrapped-anim-3 text-white/90 text-xl font-semibold text-center">
            {stats.toughestModule!.name}
          </p>
          <p className="wrapped-anim-4 text-white/50 text-sm mt-3">
            Every expert was once a beginner
          </p>
        </>
      ),
    });
  }

  cardConfigs.push({
    key: "rank",
    el: (visible) => (
      <>
        <p className="wrapped-anim-1 text-white/70 text-sm font-medium uppercase tracking-[0.3em] mb-6">
          Among {CAMPUS_STATS.totalStudents} students
        </p>
        <div className="wrapped-anim-2 text-7xl sm:text-9xl font-black text-white">
          Top <CountUpNumber value={100 - stats.percentile} isVisible={visible} decimals={0} />%
        </div>
        <p className="wrapped-anim-3 text-white/60 text-lg mt-4">
          of your cohort
        </p>
      </>
    ),
  });

  if (stats.level5Avg !== null && stats.level6Avg !== null) {
    const l5 = stats.level5Avg;
    const l6 = stats.level6Avg;
    cardConfigs.push({
      key: "growth",
      el: (visible) => (
        <>
          <p className="wrapped-anim-1 text-white/70 text-sm font-medium uppercase tracking-[0.3em] mb-8">
            Your growth
          </p>
          <div className="wrapped-anim-2 flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl sm:text-6xl font-black text-white/60">
                <CountUpNumber value={l5} isVisible={visible} />%
              </div>
              <p className="text-white/40 text-sm mt-2">3rd Year</p>
            </div>
            <div className="text-4xl text-white/40">&rarr;</div>
            <div className="text-center">
              <div className="text-5xl sm:text-6xl font-black text-white">
                <CountUpNumber value={l6} isVisible={visible} />%
              </div>
              <p className="text-white/70 text-sm mt-2">4th Year</p>
            </div>
          </div>
          <p className="wrapped-anim-3 text-white/60 text-lg mt-8">
            {l6 > l5 ? `+${(l6 - l5).toFixed(1)}% improvement` : "Consistent across both years"}
          </p>
        </>
      ),
    });
  }

  cardConfigs.push({
    key: "credits",
    el: (visible) => (
      <>
        <p className="wrapped-anim-1 text-white/70 text-sm font-medium uppercase tracking-[0.3em] mb-6">
          Credits earned
        </p>
        <div className="wrapped-anim-2 text-7xl sm:text-8xl font-black text-white mb-2">
          <CountUpNumber value={stats.creditsCompleted} isVisible={visible} decimals={0} />
          <span className="text-4xl text-white/50">/{stats.totalCredits}</span>
        </div>
        <p className="wrapped-anim-3 text-white/60 text-lg mb-12">
          {Math.round((stats.creditsCompleted / stats.totalCredits) * 100)}% of your degree
        </p>
        <button
          onClick={() => setShareOpen(true)}
          className="wrapped-anim-4 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-semibold text-lg transition-all backdrop-blur-sm border border-white/20 cursor-pointer hover:scale-105 active:scale-95"
        >
          <Share2 size={20} />
          Share Your Story
        </button>
      </>
    ),
  });

  return (
    <div className="min-h-screen">
      <ProgressDots total={cardConfigs.length} current={activeCard} />

      <div className="snap-y snap-mandatory h-screen overflow-y-auto">
        {cardConfigs.map((card, i) => (
          <WrappedCard
            key={card.key}
            index={i}
            gradient={CARDS[i % CARDS.length].bg}
            onVisible={handleCardVisible}
          >
            {card.el(activeCard === i)}
          </WrappedCard>
        ))}
      </div>

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

      {/* Hidden story card for screenshot capture */}
      <div className="fixed left-0 top-0 -z-50 pointer-events-none" aria-hidden="true">
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
          {/* Decorative circles for the story card */}
          <div style={{ position: "absolute", top: 120, right: 60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", bottom: 200, left: 40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ position: "absolute", top: 400, left: 140, width: 80, height: 80, borderRadius: "30%", background: "rgba(255,255,255,0.05)", transform: "rotate(45deg)" }} />

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
