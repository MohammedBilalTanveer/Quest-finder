// Per-browser "done" marks. Stored only in this visitor's localStorage.
const KEY = "questFinder.done.v1";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // quests are short-lived; forget old marks

export function pruneDone(map, now = Date.now()) {
  const out = {};
  for (const [id, ts] of Object.entries(map || {})) {
    if (typeof ts === "number" && now - ts < MAX_AGE_MS) out[id] = ts;
  }
  return out;
}

export function loadDone() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? pruneDone(parsed) : {};
  } catch {
    return {};
  }
}

export function saveDone(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* storage blocked or full: marks just won't persist */
  }
}

export function toggleDone(map, id, now = Date.now()) {
  const next = { ...map };
  if (next[id]) delete next[id];
  else next[id] = now;
  return next;
}
