interface PeerCardProps {
  name: string;
  course: string;
  canTeach: string[];
  needsHelp: string[];
  bio?: string | null;
  contact?: string | null;
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

export default function PeerCard({
  name,
  course,
  canTeach,
  needsHelp,
  bio,
  contact,
  highlightSkill,
}: PeerCardProps) {
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  return (
    <div className="loop-card p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-sm shrink-0`}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-[var(--color-loop-text)] truncate">
            {name}
          </h3>
          <p className="text-sm text-[var(--color-loop-muted)] truncate">
            {course}
          </p>
        </div>
      </div>

      {/* Can Teach */}
      {canTeach.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[var(--color-loop-muted)] mb-2 uppercase tracking-wide">
            Can Teach
          </p>
          <div className="flex flex-wrap gap-1.5">
            {canTeach.map((skill) => (
              <span
                key={skill}
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  highlightSkill &&
                  skill.toLowerCase() === highlightSkill.toLowerCase()
                    ? "bg-[var(--color-loop-green)] text-white ring-2 ring-[var(--color-loop-green)] ring-offset-1 ring-offset-[var(--color-loop-surface)]"
                    : "bg-[var(--color-loop-green)]/15 text-[var(--color-loop-green)]"
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Needs Help */}
      {needsHelp.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[var(--color-loop-muted)] mb-2 uppercase tracking-wide">
            Needs Help
          </p>
          <div className="flex flex-wrap gap-1.5">
            {needsHelp.map((skill) => (
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
