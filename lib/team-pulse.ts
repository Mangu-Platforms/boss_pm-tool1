export type PulseRating = 1 | 2 | 3 | 4 | 5;

export type PulseEntry = {
  id: string;
  user_id: string;
  rating: PulseRating;
  comment: string;
  sprint_id: string | null;
  created_at: string;
};

let nextId = 7;
function genId() { return `pulse-${nextId++}`; }

const store: PulseEntry[] = [
  { id: "pulse-1", user_id: "max", rating: 4, comment: "Good sprint, on track", sprint_id: "sprint-1", created_at: "2025-03-15T10:00:00Z" },
  { id: "pulse-2", user_id: "alice", rating: 3, comment: "Some blockers this week", sprint_id: "sprint-1", created_at: "2025-03-15T10:00:00Z" },
  { id: "pulse-3", user_id: "bob", rating: 5, comment: "Excellent velocity", sprint_id: "sprint-1", created_at: "2025-03-15T10:00:00Z" },
  { id: "pulse-4", user_id: "max", rating: 3, comment: "Scope creep impacting delivery", sprint_id: "sprint-2", created_at: "2025-03-22T10:00:00Z" },
  { id: "pulse-5", user_id: "alice", rating: 4, comment: "Better after standup changes", sprint_id: "sprint-2", created_at: "2025-03-22T10:00:00Z" },
  { id: "pulse-6", user_id: "bob", rating: 2, comment: "Too many context switches", sprint_id: "sprint-2", created_at: "2025-03-22T10:00:00Z" },
];

export function listPulses(sprintId?: string): PulseEntry[] {
  if (sprintId) return store.filter((p) => p.sprint_id === sprintId);
  return [...store];
}

export function addPulse(userId: string, rating: PulseRating, comment: string, sprintId: string | null = null): PulseEntry {
  const entry: PulseEntry = { id: genId(), user_id: userId, rating, comment, sprint_id: sprintId, created_at: new Date().toISOString() };
  store.push(entry);
  return entry;
}

export function averageRating(sprintId?: string): number {
  const entries = sprintId ? store.filter((p) => p.sprint_id === sprintId) : store;
  if (entries.length === 0) return 0;
  return Math.round((entries.reduce((sum, p) => sum + p.rating, 0) / entries.length) * 10) / 10;
}

export function pulseTrend(): { sprint_id: string; avg_rating: number; count: number }[] {
  const grouped: Record<string, PulseEntry[]> = {};
  store.forEach((p) => {
    const key = p.sprint_id || "none";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });
  return Object.entries(grouped).map(([sprint_id, entries]) => ({
    sprint_id,
    avg_rating: Math.round((entries.reduce((sum, p) => sum + p.rating, 0) / entries.length) * 10) / 10,
    count: entries.length,
  }));
}

export function userPulses(userId: string): PulseEntry[] {
  return store.filter((p) => p.user_id === userId);
}
