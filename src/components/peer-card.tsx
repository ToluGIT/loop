import { ExternalLink } from "lucide-react";
import { getSkillResources, type SkillResource } from "@/lib/skill-resources";

interface PeerCardProps {
  name: string;
  email: string;
  course: string;
  avatar?: string | null;
  canTeach: string[];
  needsHelp: string[];
  bio?: string | null;
  contact?: string | null;
  highlightModule?: string;
  highlightSkill?: string;
}

const avatarColors = [
  "bg-orange-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-teal-600",
  "bg-sky-600",
  "bg-pink-600",
];

const MODULE_CODE_REGEX = /^CMM\d+$/i;

function isModuleCode(tag: string): boolean {
  return MODULE_CODE_REGEX.test(tag);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function isHighlighted(tag: string, highlightModule?: string, highlightSkill?: string): boolean {
  if (highlightModule && tag.toUpperCase() === highlightModule.toUpperCase()) return true;
  if (highlightSkill && tag.toLowerCase() === highlightSkill.toLowerCase()) return true;
  return false;
}

function ResourceTypeIcon({ type }: { type: SkillResource["type"] }) {
  switch (type) {
    case "course":
      return <span className="text-[10px]" title="Course">🎓</span>;
    case "docs":
      return <span className="text-[10px]" title="Documentation">📖</span>;
    case "tool":
      return <span className="text-[10px]" title="Tool">🔧</span>;
    case "community":
      return <span className="text-[10px]" title="Community">👥</span>;
  }
}

function OutlookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 8.608v8.142a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5V7.108a.5.5 0 01.5-.5h7.146a.5.5 0 01.354.146l.854.854z" fill="#0364B8"/>
      <path d="M22 8.608H17.75a.5.5 0 01-.5-.5V3.858L22 8.608z" fill="#0A2767" opacity=".5"/>
      <path d="M13.5 6.608v10.142a.5.5 0 01-.5.5H2.5a.5.5 0 01-.5-.5V6.608a.5.5 0 01.5-.5H13a.5.5 0 01.5.5z" fill="#0078D4"/>
      <ellipse cx="7.75" cy="11.679" rx="3.25" ry="3" fill="#fff"/>
      <path d="M7.75 9.429c-1.519 0-2.75 1.007-2.75 2.25s1.231 2.25 2.75 2.25S10.5 12.922 10.5 11.679s-1.231-2.25-2.75-2.25z" fill="#0078D4"/>
    </svg>
  );
}

function TeamsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.5 6a2 2 0 100-4 2 2 0 000 4z" fill="#5059C9"/>
      <path d="M21 7h-5.5a1 1 0 00-1 1v5.5a3.5 3.5 0 003.5 3.5h.5A3.5 3.5 0 0022 13.5V8a1 1 0 00-1-1z" fill="#5059C9"/>
      <path d="M11.5 5.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" fill="#7B83EB"/>
      <path d="M15 7H5a1 1 0 00-1 1v7a4 4 0 004 4h3a4 4 0 004-4V8a1 1 0 00-1-1z" fill="#7B83EB"/>
      <rect x="7" y="10" width="5" height="1" rx=".5" fill="#fff"/>
      <rect x="7" y="12.5" width="3.5" height="1" rx=".5" fill="#fff"/>
    </svg>
  );
}

export default function PeerCard({
  name,
  email,
  course,
  avatar,
  canTeach,
  needsHelp,
  bio,
  contact,
  highlightModule,
  highlightSkill,
}: PeerCardProps) {
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  // Separate modules and skills in canTeach
  const teachModules = canTeach.filter(isModuleCode);
  const teachSkills = canTeach.filter((t) => !isModuleCode(t));

  // Separate modules and skills in needsHelp
  const helpModules = needsHelp.filter(isModuleCode);
  const helpSkills = needsHelp.filter((t) => !isModuleCode(t));

  // Collect resources for all teach skills
  const allResources = new Map<string, SkillResource[]>();
  for (const skill of [...teachSkills, ...teachModules]) {
    const resources = getSkillResources(skill);
    if (resources.length > 0) {
      allResources.set(skill, resources);
    }
  }

  const outlookUrl = `mailto:${email}?subject=${encodeURIComponent(`Loop - Peer Help Request`)}&body=${encodeURIComponent(`Hi ${name.split(" ")[0]},\n\nI found your profile on Loop and would love to connect!\n\n`)}`;
  const teamsUrl = `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}&message=${encodeURIComponent(`Hi ${name.split(" ")[0]}! I found your profile on Loop and would love to connect about studying together.`)}`;

  return (
    <div className="loop-card p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full shrink-0 bg-[var(--color-loop-surface-2)]"
          />
        ) : (
          <div
            className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-sm shrink-0`}
          >
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[var(--color-loop-text)] truncate">
            {name}
          </h3>
          <p className="text-sm text-[var(--color-loop-muted)] truncate">
            {course}
          </p>
        </div>
        {/* Contact icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={outlookUrl}
            title="Send email via Outlook"
            className="p-2 rounded-lg hover:bg-[var(--color-loop-surface-2)] text-[var(--color-loop-muted)] hover:text-[#0078d4] transition-colors"
          >
            <OutlookIcon />
          </a>
          <a
            href={teamsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on Microsoft Teams"
            className="p-2 rounded-lg hover:bg-[var(--color-loop-surface-2)] text-[var(--color-loop-muted)] hover:text-[#6264a7] transition-colors"
          >
            <TeamsIcon />
          </a>
        </div>
      </div>

      {/* Can Teach - Modules */}
      {teachModules.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[var(--color-loop-muted)] mb-2 uppercase tracking-wide">
            Can Teach &mdash; Modules
          </p>
          <div className="flex flex-wrap gap-1.5">
            {teachModules.map((mod) => (
              <span
                key={mod}
                className={`px-2.5 py-1 rounded-full text-xs font-medium font-mono ${
                  isHighlighted(mod, highlightModule, highlightSkill)
                    ? "bg-[var(--color-loop-green)] text-white ring-2 ring-[var(--color-loop-green)] ring-offset-1 ring-offset-[var(--color-loop-surface)]"
                    : "bg-[var(--color-loop-green)]/15 text-[var(--color-loop-green)]"
                }`}
              >
                {mod}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Can Teach - Skills */}
      {teachSkills.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[var(--color-loop-muted)] mb-2 uppercase tracking-wide">
            Can Teach &mdash; Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {teachSkills.map((skill) => (
              <span
                key={skill}
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  isHighlighted(skill, highlightModule, highlightSkill)
                    ? "bg-[var(--color-loop-accent)] text-white ring-2 ring-[var(--color-loop-accent)] ring-offset-1 ring-offset-[var(--color-loop-surface)]"
                    : "bg-[var(--color-loop-accent)]/15 text-[var(--color-loop-accent)]"
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Needs Help - Modules */}
      {helpModules.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[var(--color-loop-muted)] mb-2 uppercase tracking-wide">
            Needs Help &mdash; Modules
          </p>
          <div className="flex flex-wrap gap-1.5">
            {helpModules.map((mod) => (
              <span
                key={mod}
                className="px-2.5 py-1 rounded-full text-xs font-medium font-mono bg-[var(--color-loop-amber)]/15 text-[var(--color-loop-amber)]"
              >
                {mod}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Needs Help - Skills */}
      {helpSkills.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[var(--color-loop-muted)] mb-2 uppercase tracking-wide">
            Needs Help &mdash; Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {helpSkills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-loop-amber)]/15 text-[var(--color-loop-amber)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      {bio && (
        <p className="text-sm text-[var(--color-loop-muted)] line-clamp-2">
          {bio}
        </p>
      )}

      {/* Learning Resources */}
      {allResources.size > 0 && (
        <div className="border-t border-[var(--color-loop-border)] pt-3">
          <p className="text-xs font-medium text-[var(--color-loop-muted)] mb-2 uppercase tracking-wide">
            Learning Resources
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(allResources.entries())
              .flatMap(([, resources]) => resources)
              .slice(0, 4)
              .map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-[var(--color-loop-surface-2)] text-[var(--color-loop-muted)] hover:text-[var(--color-loop-text)] hover:bg-[var(--color-loop-border)] transition-colors"
                >
                  <ResourceTypeIcon type={r.type} />
                  {r.name}
                  <ExternalLink size={8} className="opacity-50" />
                </a>
              ))}
          </div>
        </div>
      )}

      {/* Contact */}
      {contact && (
        <div className="mt-auto pt-2 border-t border-[var(--color-loop-border)]">
          <p className="text-xs text-[var(--color-loop-muted)]">
            <span className="font-medium text-[var(--color-loop-text)]">
              Contact:
            </span>{" "}
            {contact}
          </p>
        </div>
      )}
    </div>
  );
}
