export const MOOD_KEYS = [
  "confident",
  "okay",
  "struggling",
  "overwhelmed",
] as const;

export type MoodKey = (typeof MOOD_KEYS)[number];

export const ALLOWED_MOODS = new Set<string>(MOOD_KEYS);

export const PULSE_TREND_WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"] as const;

export const SPOT_TYPES = ["library", "lab", "social", "building"] as const;
export type SpotType = (typeof SPOT_TYPES)[number];

export const NOISE_LEVELS = ["quiet", "moderate", "loud"] as const;
export type NoiseLevel = (typeof NOISE_LEVELS)[number];
