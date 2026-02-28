import Link from "next/link";
import { BarChart3, SlidersHorizontal, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 animate-fade-in-up">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-loop-surface)] border border-[var(--color-loop-border)] text-sm text-[var(--color-loop-muted)]">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-loop-green)] animate-pulse" />
          Built at RGU Hacks 2026
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
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

        <p className="text-lg sm:text-xl text-[var(--color-loop-muted)] mb-10 max-w-xl mx-auto">
          Loop shows you exactly where you stand with your degree and connects
          you with peers who can help. Real-time grade projection. Free peer
          support. One app.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="loop-btn px-8 py-4 rounded-xl bg-[var(--color-loop-primary)] hover:bg-[var(--color-loop-primary-hover)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] text-white font-semibold text-lg transition-all"
          >
            Launch Dashboard
          </Link>
          <Link
            href="/simulator"
            className="loop-btn px-8 py-4 rounded-xl border border-[var(--color-loop-border)] hover:border-[var(--color-loop-primary)] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] text-[var(--color-loop-text)] font-semibold text-lg transition-all"
          >
            Try the Simulator
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto w-full px-4 animate-stagger">
        <FeatureCard
          icon={<BarChart3 className="w-5 h-5 text-[var(--color-loop-primary)]" />}
          title="Grade Projection"
          description="See your projected degree classification update in real-time as you enter grades."
        />
        <FeatureCard
          icon={<SlidersHorizontal className="w-5 h-5 text-[var(--color-loop-primary)]" />}
          title="What-If Simulator"
          description='Drag the slider to answer "What do I need on my exam to get a 2:1?"'
        />
        <FeatureCard
          icon={<Users className="w-5 h-5 text-[var(--color-loop-primary)]" />}
          title="Peer Matching"
          description="Struggling with a module? Find classmates who can help — for free."
        />
      </div>

      {/* Stats Bar */}
      <div className="mt-12 loop-card inline-flex gap-8 px-8 py-4 text-center text-[var(--color-loop-muted)]">
        <Stat value="247" label="Students" />
        <Stat value="8" label="Modules" />
        <Stat value="Free" label="Always" />
      </div>

      <footer className="mt-24 mb-8 text-sm text-[var(--color-loop-muted)]">
        Loop &mdash; RGU Hacks 2026 &mdash; Team Loop
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="loop-card-interactive p-6 group">
      <div className="w-10 h-10 rounded-lg bg-[var(--color-loop-primary)]/10 flex items-center justify-center mb-3 group-hover:bg-[var(--color-loop-primary)]/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-loop-muted)]">{description}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-[var(--color-loop-text)]">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}
