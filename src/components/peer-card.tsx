import { Mail, MessageSquare } from "lucide-react";

interface PeerCardProps {
  name: string;
  email: string;
  course: string;
  canTeach: string[];
  needsHelp: string[];
  bio?: string | null;
  contact?: string | null;
  highlightModule?: string;
  highlightSkill?: string;
}

const avatarColors = [
  "bg-indigo-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-purple-600",
  "bg-teal-600",
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

export default function PeerCard({
  name,
  email,
  course,
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

  const outlookUrl = `mailto:${email}?subject=${encodeURIComponent(`Loop - Peer Help Request`)}&body=${encodeURIComponent(`Hi ${name.split(" ")[0]},\n\nI found your profile on Loop and would love to connect!\n\n`)}`;
  const teamsUrl = `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}&message=${encodeURIComponent(`Hi ${name.split(" ")[0]}! I found your profile on Loop and would love to connect about studying together.`)}`;

  return (
    <div className="loop-card p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-sm shrink-0`}
        >
          {initials}
        </div>
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
            <Mail size={18} />
          </a>
          <a
            href={teamsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on Microsoft Teams"
            className="p-2 rounded-lg hover:bg-[var(--color-loop-surface-2)] text-[var(--color-loop-muted)] hover:text-[#6264a7] transition-colors"
          >
            <MessageSquare size={18} />
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
                    ? "bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-1 ring-offset-[var(--color-loop-surface)]"
                    : "bg-blue-500/15 text-blue-400"
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
