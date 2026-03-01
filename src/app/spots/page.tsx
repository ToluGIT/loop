"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getAnonymousClientId } from "@/lib/anonymous-client";
import type { NoiseLevel, SpotType } from "@/lib/constants";
import { MapPin, Users, Volume2, VolumeX, Volume1, Wifi } from "lucide-react";

interface Spot {
  id: string;
  name: string;
  type: SpotType;
  floor: string;
  peersNow: number;
  capacity: number;
  topSkills: string[];
  activeGroups: number;
  noiseLevel: NoiseLevel;
  lat: number;
  lng: number;
}

const CampusMap = dynamic(() => import("@/components/campus-map"), {
  ssr: false,
  loading: () => (
    <div className="loop-card flex items-center justify-center" style={{ height: 380 }}>
      <div className="animate-pulse text-[var(--color-loop-muted)]">Loading map...</div>
    </div>
  ),
});

const typeConfig = {
  library: { label: "Library", icon: "📚" },
  lab: { label: "Computer Lab", icon: "💻" },
  social: { label: "Social Space", icon: "☕" },
  building: { label: "Building", icon: "🏢" },
} as const;

const noiseConfig = {
  quiet: { label: "Quiet", icon: VolumeX, color: "text-[var(--color-loop-green)]" },
  moderate: { label: "Moderate", icon: Volume1, color: "text-[var(--color-loop-amber)]" },
  loud: { label: "Lively", icon: Volume2, color: "text-[var(--color-loop-primary)]" },
} as const;

export default function SpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [checkedIn, setCheckedIn] = useState<string | null>(null);
  const [filter, setFilter] = useState<SpotType | "all">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const response = await fetch("/api/spots");
    if (!response.ok) throw new Error("Failed to fetch spots");
    const payload: { spots: Spot[] } = await response.json();
    setSpots(payload.spots);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const filteredSpots = useMemo(
    () => (filter === "all" ? spots : spots.filter((spot) => spot.type === filter)),
    [filter, spots]
  );

  const totalPeers = useMemo(() => spots.reduce((sum, spot) => sum + spot.peersNow, 0), [spots]);
  const totalGroups = useMemo(() => spots.reduce((sum, spot) => sum + spot.activeGroups, 0), [spots]);

  const syncCheckIn = async (nextSpotId: string | null) => {
    setSaving(true);
    const clientId = getAnonymousClientId();
    try {
      if (checkedIn && checkedIn !== nextSpotId) {
        await fetch("/api/spots", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spotId: checkedIn, clientId }),
        });
      }

      if (nextSpotId) {
        await fetch("/api/spots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spotId: nextSpotId, clientId }),
        });
        setCheckedIn(nextSpotId);
      } else if (checkedIn) {
        await fetch("/api/spots", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spotId: checkedIn, clientId }),
        });
        setCheckedIn(null);
      }

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
        <div className="animate-pulse text-[var(--color-loop-muted)]">Loading study spots...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Study Spots</h1>
          <p className="text-[var(--color-loop-muted)]">Live campus activity from peer check-ins.</p>
        </div>

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
            <div className="text-2xl font-bold text-[var(--color-loop-accent)]">{spots.length}</div>
            <div className="text-xs text-[var(--color-loop-muted)]">Study locations</div>
          </div>
          <div className="loop-card p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-loop-amber)]">{checkedIn ? "1" : "0"}</div>
            <div className="text-xs text-[var(--color-loop-muted)]">Your check-ins</div>
          </div>
        </div>

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

        <div className="mb-6">
          <CampusMap
            spots={filteredSpots}
            checkedIn={checkedIn}
            onCheckIn={(id) => {
              void syncCheckIn(id || null);
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredSpots.map((spot) => {
            const noise = noiseConfig[spot.noiseLevel];
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
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeConfig[spot.type].icon}</span>
                    <div>
                      <h3 className="font-semibold text-[var(--color-loop-text)]">{spot.name}</h3>
                      <p className="text-xs text-[var(--color-loop-muted)]">
                        {spot.floor} &middot; {typeConfig[spot.type].label}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${noise.color}`}>
                    <NoiseIcon size={14} />
                    <span>{noise.label}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[var(--color-loop-muted)]">Occupancy</span>
                    <span className="font-semibold" style={{ color: occupancy >= 80 ? "#EF4444" : occupancy >= 50 ? "#F59E0B" : "#22C55E" }}>
                      {spot.peersNow}/{spot.capacity} ({occupancy}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--color-loop-surface-2)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, occupancy)}%`, background: occupancy >= 80 ? "#EF4444" : occupancy >= 50 ? "#F59E0B" : "#22C55E" }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-[var(--color-loop-muted)]">
                  <span className="flex items-center gap-1"><Users size={12} />{spot.peersNow} peers</span>
                  <span className="flex items-center gap-1"><MapPin size={12} />{spot.floor}</span>
                </div>

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

                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-loop-border)]">
                  <div className="flex items-center gap-3 text-xs text-[var(--color-loop-muted)]">
                    {spot.activeGroups > 0 && (
                      <span className="flex items-center gap-1">
                        <Wifi size={12} className="text-[var(--color-loop-green)]" />
                        {spot.activeGroups} active group{spot.activeGroups !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      void syncCheckIn(isCheckedIn ? null : spot.id);
                    }}
                    disabled={saving}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-60 ${
                      isCheckedIn
                        ? "bg-[var(--color-loop-green)] text-white"
                        : "bg-[var(--color-loop-primary)] text-white hover:bg-[var(--color-loop-primary-hover)]"
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
