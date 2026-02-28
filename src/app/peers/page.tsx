"use client";

import { useEffect, useState, useMemo } from "react";
import PeerCard from "@/components/peer-card";

interface PeerProfile {
  id: string;
  userId: string;
  canTeach: string[];
  needsHelp: string[];
  bio: string | null;
  contact: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    course: string;
    year: number;
  };
}

const MODULE_CODE_REGEX = /^CMM\d+$/i;

function isModuleCode(tag: string): boolean {
  return MODULE_CODE_REGEX.test(tag);
}

export default function PeersPage() {
  const [allPeers, setAllPeers] = useState<PeerProfile[]>([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all peers on mount
  useEffect(() => {
    fetch("/api/peers")
      .then((res) => res.json())
      .then((data: PeerProfile[]) => {
        setAllPeers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Separate module codes from skills across all peers
  const { moduleList, skillList } = useMemo(() => {
    const modules = new Set<string>();
    const skills = new Set<string>();
    allPeers.forEach((peer) => {
      [...peer.canTeach, ...peer.needsHelp].forEach((tag) => {
        if (isModuleCode(tag)) modules.add(tag.toUpperCase());
        else skills.add(tag);
      });
    });
    return {
      moduleList: Array.from(modules).sort(),
      skillList: Array.from(skills).sort(),
    };
  }, [allPeers]);

  // Filter peers based on both selections
  const peers = useMemo(() => {
    return allPeers.filter((p) => {
      const allTags = [...p.canTeach, ...p.needsHelp];
      const matchesModule =
        !selectedModule ||
        allTags.some((t) => t.toUpperCase() === selectedModule.toUpperCase());
      const matchesSkill =
        !selectedSkill ||
        allTags.some((t) => t.toLowerCase() === selectedSkill.toLowerCase());
      return matchesModule && matchesSkill;
    });
  }, [allPeers, selectedModule, selectedSkill]);

  const activeFilterLabel = [selectedModule, selectedSkill]
    .filter(Boolean)
    .join(" + ");

  return (
    <div className="min-h-screen px-4 py-8 max-w-5xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Peer{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-loop-green)] to-[var(--color-loop-gold)]">
            Matching
          </span>
        </h1>
        <p className="text-[var(--color-loop-muted)] mt-2">
          Struggling with a module? Find classmates who can help — for free.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="loop-card p-4 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Module filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label
              htmlFor="module-filter"
              className="text-sm font-medium text-[var(--color-loop-muted)] shrink-0"
            >
              Module:
            </label>
            <select
              id="module-filter"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 rounded-lg bg-[var(--color-loop-surface-2)] border border-[var(--color-loop-border)] text-[var(--color-loop-text)] text-sm focus:outline-none focus:border-[var(--color-loop-primary)] transition-colors"
            >
              <option value="">All modules</option>
              {moduleList.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>

          {/* Skill filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label
              htmlFor="skill-filter"
              className="text-sm font-medium text-[var(--color-loop-muted)] shrink-0"
            >
              Skill:
            </label>
            <select
              id="skill-filter"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 rounded-lg bg-[var(--color-loop-surface-2)] border border-[var(--color-loop-border)] text-[var(--color-loop-text)] text-sm focus:outline-none focus:border-[var(--color-loop-primary)] transition-colors"
            >
              <option value="">All skills</option>
              {skillList.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {(selectedModule || selectedSkill) && (
            <button
              onClick={() => {
                setSelectedModule("");
                setSelectedSkill("");
              }}
              className="text-xs text-[var(--color-loop-muted)] hover:text-[var(--color-loop-text)] transition-colors underline"
            >
              Clear all
            </button>
          )}

          <div className="sm:ml-auto">
            <button className="loop-btn px-4 py-2 rounded-lg bg-[var(--color-loop-primary)] hover:bg-[var(--color-loop-primary-hover)] text-white text-sm font-medium transition-colors cursor-pointer">
              + Add Your Skills
            </button>
          </div>
        </div>

        {activeFilterLabel && (
          <p className="text-sm text-[var(--color-loop-green)] font-medium">
            {peers.length} peer{peers.length !== 1 ? "s" : ""} matching{" "}
            {activeFilterLabel}
          </p>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[var(--color-loop-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : peers.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-lg font-medium text-[var(--color-loop-text)]">
            No peers found
          </p>
          <p className="text-sm text-[var(--color-loop-muted)] mt-1">
            {activeFilterLabel
              ? `Nobody matches the current filters. Try broadening your search.`
              : "No skill profiles have been created yet."}
          </p>
          <button className="mt-6 px-6 py-3 rounded-xl bg-[var(--color-loop-primary)] hover:bg-[var(--color-loop-primary-hover)] text-white font-semibold transition-colors">
            Be the first — Add Your Skills
          </button>
        </div>
      ) : (
        <>
          {!activeFilterLabel && (
            <p className="text-sm text-[var(--color-loop-muted)] mb-4">
              Showing {peers.length} peer{peers.length !== 1 ? "s" : ""} with
              skill profiles
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {peers.map((peer) => (
              <PeerCard
                key={peer.id}
                name={peer.user.name}
                email={peer.user.email}
                course={peer.user.course}
                canTeach={peer.canTeach}
                needsHelp={peer.needsHelp}
                bio={peer.bio}
                contact={peer.contact}
                highlightModule={selectedModule || undefined}
                highlightSkill={selectedSkill || undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
