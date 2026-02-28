"use client";

import { useState } from "react";
import { STUDY_SPOTS } from "@/lib/mock-data";
import { MapPin, Users, Volume2, VolumeX, Volume1, Wifi } from "lucide-react";

const typeConfig = {
  library: { label: "Library", color: "bg-blue-500", icon: "📚" },
  lab: { label: "Computer Lab", color: "bg-purple-500", icon: "💻" },
  social: { label: "Social Space", color: "bg-green-500", icon: "☕" },
  building: { label: "Building", color: "bg-amber-500", icon: "🏢" },
} as const;

const noiseConfig = {
  quiet: { label: "Quiet", icon: VolumeX, color: "text-[var(--color-loop-green)]" },
  moderate: { label: "Moderate", icon: Volume1, color: "text-[var(--color-loop-amber)]" },
  loud: { label: "Lively", icon: Volume2, color: "text-[var(--color-loop-primary)]" },
} as const;

type SpotType = keyof typeof typeConfig;
type NoiseLevel = keyof typeof noiseConfig;

export default function SpotsPage() {
  const [checkedIn, setCheckedIn] = useState<string | null>(null);
  const [filter, setFilter] = useState<SpotType | "all">("all");

  const filteredSpots =
    filter === "all"
      ? STUDY_SPOTS
      : STUDY_SPOTS.filter((s) => s.type === filter);

  const totalPeers = STUDY_SPOTS.reduce((s, spot) => s + spot.peersNow, 0);
  const totalGroups = STUDY_SPOTS.reduce((s, spot) => s + spot.activeGroups, 0);

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Study Spots</h1>
          <p className="text-[var(--color-loop-muted)]">
            Find where your peers are studying right now across campus
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="loop-card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-loop-primary)]">{totalPeers}</div>
            <div className="text-xs text-[var(--color-loop-muted)]">Peers on campus</div>
          </div>
          <div className="loop-card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-loop-green)]">{totalGroups}</div>
            <div className="text-xs text-[var(--color-loop-muted)]">Active study groups</div>
          </div>
          <div className="loop-card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-loop-accent)]">{STUDY_SPOTS.length}</div>
            <div className="text-xs text-[var(--color-loop-muted)]">Study locations</div>
          </div>
          <div className="loop-card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-loop-amber)]">
              {checkedIn ? "1" : "0"}
            </div>
            <div className="text-xs text-[var(--color-loop-muted)]">Your check-ins</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "library", "lab", "social", "building"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                filter === type
                  ? "bg-[var(--color-loop-primary)] text-white"
                  : "bg-[var(--color-loop-surface-2)] text-[var(--color-loop-muted)] hover:text-[var(--color-loop-text)]"
              }`}
            >
              {type === "all" ? "All Spots" : typeConfig[type].label}
            </button>
          ))}
        </div>

        {/* Campus Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredSpots.map((spot) => {
            const config = typeConfig[spot.type as SpotType];
            const noise = noiseConfig[spot.noiseLevel as NoiseLevel];
            const NoiseIcon = noise.icon;
            const occupancy = Math.round((spot.peersNow / spot.capacity) * 100);
            const isCheckedIn = checkedIn === spot.id;

            return (
              <div
                key={spot.id}
                className={`loop-card p-5 flex flex-col gap-3 transition-all ${
                  isCheckedIn ? "ring-2 ring-[var(--color-loop-primary)] ring-offset-2 ring-offset-[var(--color-loop-bg)]" : ""
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h3 className="font-semibold text-[var(--color-loop-text)]">{spot.name}</h3>
                      <p className="text-xs text-[var(--color-loop-muted)]">
                        {spot.floor} &middot; {config.label}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${noise.color}`}>
                    <NoiseIcon size={14} />
                    <span>{noise.label}</span>
                  </div>
                </div>

                {/* Occupancy bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-[var(--color-loop-muted)] mb-1">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {spot.peersNow} peers here now
                    </span>
                    <span>{occupancy}% full</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--color-loop-surface-2)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancy >= 80
                          ? "bg-[var(--color-loop-red)]"
                          : occupancy >= 50
                            ? "bg-[var(--color-loop-amber)]"
                            : "bg-[var(--color-loop-green)]"
                      }`}
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {spot.topSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--color-loop-surface-2)] text-[var(--color-loop-muted)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-loop-border)]">
                  <div className="flex items-center gap-3 text-xs text-[var(--color-loop-muted)]">
                    {spot.activeGroups > 0 && (
                      <span className="flex items-center gap-1">
                        <Wifi size={12} className="text-[var(--color-loop-green)]" />
                        {spot.activeGroups} active group{spot.activeGroups !== 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      Garthdee Campus
                    </span>
                  </div>
                  <button
                    onClick={() => setCheckedIn(isCheckedIn ? null : spot.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isCheckedIn
                        ? "bg-[var(--color-loop-green)] text-white"
                        : "bg-[var(--color-loop-primary)]/10 text-[var(--color-loop-primary)] hover:bg-[var(--color-loop-primary)]/20"
                    }`}
                  >
                    {isCheckedIn ? "Checked In ✓" : "Check In"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
