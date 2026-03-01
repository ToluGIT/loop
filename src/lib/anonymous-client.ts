const STORAGE_KEY = "loop-anon-client-id";

function createClientId() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `anon_${Date.now().toString(36)}_${rand}`;
}

export function getAnonymousClientId(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const next = createClientId();
  localStorage.setItem(STORAGE_KEY, next);
  return next;
}
