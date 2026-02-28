"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/nav";
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

export default function PeersPage() {
  const [peers, setPeers] = useState<PeerProfile[]>([]);
  const [allPeers, setAllPeers] = useState<PeerProfile[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all peers on mount to build module list
  useEffect(() => {
    fetch("/api/peers")
      .then((res) => res.json())
      .then((data: PeerProfile[]) => {
        setAllPeers(data);
        setPeers(data);

        // Collect all unique modules from canTeach across all peers
        const allModules = new Set<string>();
        data.forEach((peer) => {
          peer.canTeach.forEach((m) => allModules.add(m));
        });
        setModules(Array.from(allModules).sort());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter when module selection changes
  useEffect(() => {
    if (!selectedModule) {
      setPeers(allPeers);
      return;
    }
    const filtered = allPeers.filter((p) =>
      p.canTeach.some(
        (skill) => skill.toLowerCase() === selectedModule.toLowerCase()
      )
    );
    setPeers(filtered);
  }, [selectedModule, allPeers]);

  return (
    <>
    <Nav />
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-[var(--color-loop-muted)] hover:text-[var(--color-loop-text)] transition-colors mb-4 inline-block"
        >
          &larr; Back to Loop
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
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
      <div className="loop-card p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <label
          htmlFor="module-filter"
          className="text-sm font-medium text-[var(--color-loop-muted)] shrink-0"
        >
          Filter by module:
        </label>
        <select
          id="module-filter"
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 rounded-lg bg-[var(--color-loop-surface-2)] border border-[var(--color-loop-border)] text-[var(--color-loop-text)] text-sm focus:outline-none focus:border-[var(--color-loop-primary)] transition-colors"
        >
          <option value="">All modules</option>
          {modules.map((mod) => (
            <option key={mod} value={mod}>
              {mod}
            </option>
          ))}
        </select>

        {selectedModule && (
          <span className="text-sm text-[var(--color-loop-green)] font-medium">
            {peers.length} peer{peers.length !== 1 ? "s" : ""} can help with{" "}
            {selectedModule}
          </span>
        )}

        <div className="sm:ml-auto">
          <button className="px-4 py-2 rounded-lg bg-[var(--color-loop-primary)] hover:bg-[var(--color-loop-primary-hover)] text-white text-sm font-medium transition-colors">
            + Add Your Skills
          </button>
        </div>
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
            {selectedModule
              ? `Nobody has listed ${selectedModule} as a teachable skill yet.`
              : "No skill profiles have been created yet."}
          </p>
          <button
            className="mt-6 px-6 py-3 rounded-xl bg-[var(--color-loop-primary)] hover:bg-[var(--color-loop-primary-hover)] text-white font-semibold transition-colors"
          >
            Be the first — Add Your Skills
          </button>
        </div>
      ) : (
        <>
          {!selectedModule && (
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
                course={peer.user.course}
                canTeach={peer.canTeach}
                needsHelp={peer.needsHelp}
                bio={peer.bio}
                contact={peer.contact}
                highlightSkill={selectedModule || undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
    </>
  );
}
