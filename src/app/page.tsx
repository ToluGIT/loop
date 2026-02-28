import Link from "next/link";
import { BarChart3, SlidersHorizontal, Users, ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen animate-fade-in-up">
      {/* Floating theme toggle */}
      <div className="fixed top-5 right-5 z-50">
        <ThemeToggle />
      </div>
      {/* Hero — Asymmetric layout */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-loop-surface)] text-sm text-[var(--color-loop-muted)] mb-6">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-loop-green)] animate-pulse" />
            Built at RGU Hacks 2026
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Know your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-loop-primary)] to-[var(--color-loop-primary-hover)]">
              grade
            </span>
            .
            <br />
            Find your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-loop-green)] to-[var(--color-loop-gold)]">
              help
            </span>
            .
          </h1>

          <p className="text-lg text-[var(--color-loop-muted)] mb-8 max-w-md">
            Loop shows you exactly where you stand with your degree and connects
            you with peers who can help. Real-time grade projection. Free peer
            support. One app.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="loop-btn inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--color-loop-primary)] hover:bg-[var(--color-loop-primary-hover)] text-white font-semibold text-base transition-all"
            >
              Launch Dashboard
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/simulator"
              className="loop-btn inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-[var(--color-loop-border)] hover:border-[var(--color-loop-primary)] text-[var(--color-loop-text)] font-semibold text-base transition-all"
            >
              Try the Simulator
            </Link>
          </div>
        </div>

        {/* Right: Visual — abstract grade visualization */}
        <div className="hidden md:flex items-center justify-center">
          <div className="relative w-72 h-72">
            {/* Decorative gradient orb */}
            <div
              className="absolute inset-0 rounded-full opacity-20 blur-3xl"
              style={{
                background: "radial-gradient(circle, var(--color-loop-primary), transparent 70%)",
              }}
            />
            {/* Central classification badge mock */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-44 h-44 rounded-full flex flex-col items-center justify-center"
                style={{
                  background: "var(--color-loop-surface)",
                  boxShadow: "0 8px 40px rgba(249, 115, 84, 0.15), 0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <span className="text-5xl font-black text-[var(--color-loop-primary)]">2:1</span>
                <span className="text-sm text-[var(--color-loop-muted)] mt-1">Projected</span>
              </div>
            </div>
            {/* Floating stat pills */}
            <div
              className="absolute top-4 right-0 loop-card px-3 py-2 text-xs"
              style={{ animation: "fade-in-up 0.6s ease-out 0.3s both" }}
            >
              <span className="font-bold text-[var(--color-loop-green)]">68.4%</span>
              <span className="text-[var(--color-loop-muted)] ml-1">avg</span>
            </div>
            <div
              className="absolute bottom-8 left-0 loop-card px-3 py-2 text-xs"
              style={{ animation: "fade-in-up 0.6s ease-out 0.5s both" }}
            >
              <span className="font-bold text-[var(--color-loop-accent)]">360</span>
              <span className="text-[var(--color-loop-muted)] ml-1">credits</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Feature Grid — asymmetric (2 large + 1 small) */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bento-grid animate-stagger">
          {/* Large card — spans 2 cols */}
          <div className="loop-card-interactive p-8 span-2 group">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-loop-primary)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-loop-primary)]/20 transition-colors">
                <BarChart3 className="w-6 h-6 text-[var(--color-loop-primary)]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Grade Projection</h3>
                <p className="text-[var(--color-loop-muted)] leading-relaxed">
                  See your projected degree classification update in real-time as
                  grades come in. UK Honours algorithm with proper L5/L6 weighting.
                </p>
              </div>
            </div>
          </div>

          {/* Small card */}
          <div className="loop-card-interactive p-6 group flex flex-col justify-between">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-loop-green)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--color-loop-green)]/20 transition-colors">
              <Users className="w-5 h-5 text-[var(--color-loop-green)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Peer Matching</h3>
              <p className="text-sm text-[var(--color-loop-muted)]">
                Struggling? Find classmates who can help — for free.
              </p>
            </div>
          </div>

          {/* Small card */}
          <div className="loop-card-interactive p-6 group flex flex-col justify-between">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-loop-accent)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--color-loop-accent)]/20 transition-colors">
              <SlidersHorizontal className="w-5 h-5 text-[var(--color-loop-accent)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">What-If Simulator</h3>
              <p className="text-sm text-[var(--color-loop-muted)]">
                Drag sliders to answer &ldquo;What do I need to get a 2:1?&rdquo;
              </p>
            </div>
          </div>

          {/* Large card — spans 2 cols */}
          <div className="loop-card-interactive p-8 span-2 group">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-loop-amber)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-loop-amber)]/20 transition-colors">
                <svg className="w-6 h-6 text-[var(--color-loop-amber)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Campus Analytics</h3>
                <p className="text-[var(--color-loop-muted)] leading-relaxed">
                  See how you compare. Anonymous, aggregated stats across all
                  computing students — module performance, classification trends, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="loop-card inline-flex gap-8 px-8 py-5 mx-auto w-full justify-center">
          <Stat value="247" label="Students" />
          <Stat value="8" label="Modules" />
          <Stat value="Free" label="Always" />
        </div>
      </section>

      <footer className="text-center pb-8 text-sm text-[var(--color-loop-muted)]">
        Loop &mdash; RGU Hacks 2026 &mdash; Team Loop
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-[var(--color-loop-text)]">{value}</div>
      <div className="text-xs text-[var(--color-loop-muted)]">{label}</div>
    </div>
  );
}
