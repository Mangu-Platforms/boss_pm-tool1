export type FocusStatus = "idle" | "focusing" | "break" | "long_break";

export type FocusSession = {
  id: string;
  user_id: string;
  issue_id: string | null;
  status: FocusStatus;
  duration_minutes: number;
  break_minutes: number;
  started_at: string;
  completed_at: string | null;
  pomodoros_completed: number;
};

let nextId = 5;
function genId() { return `focus-${nextId++}`; }

const store: FocusSession[] = [
  { id: "focus-1", user_id: "max", issue_id: "BOSS-1", status: "idle", duration_minutes: 25, break_minutes: 5, started_at: "2025-03-20T09:00:00Z", completed_at: "2025-03-20T09:25:00Z", pomodoros_completed: 3 },
  { id: "focus-2", user_id: "alice", issue_id: "BOSS-2", status: "idle", duration_minutes: 25, break_minutes: 5, started_at: "2025-03-20T10:00:00Z", completed_at: "2025-03-20T10:25:00Z", pomodoros_completed: 2 },
  { id: "focus-3", user_id: "max", issue_id: null, status: "idle", duration_minutes: 50, break_minutes: 10, started_at: "2025-03-21T09:00:00Z", completed_at: "2025-03-21T09:50:00Z", pomodoros_completed: 1 },
  { id: "focus-4", user_id: "bob", issue_id: "BOSS-3", status: "focusing", duration_minutes: 25, break_minutes: 5, started_at: "2025-03-22T09:00:00Z", completed_at: null, pomodoros_completed: 0 },
];

export function listSessions(userId?: string): FocusSession[] {
  if (userId) return store.filter((s) => s.user_id === userId);
  return [...store];
}

export function getSession(id: string): FocusSession | null {
  return store.find((s) => s.id === id) || null;
}

export function startFocus(userId: string, issueId: string | null, durationMinutes: number = 25, breakMinutes: number = 5): FocusSession {
  const session: FocusSession = {
    id: genId(), user_id: userId, issue_id: issueId, status: "focusing",
    duration_minutes: durationMinutes, break_minutes: breakMinutes,
    started_at: new Date().toISOString(), completed_at: null, pomodoros_completed: 0,
  };
  store.push(session);
  return session;
}

export function completeFocus(id: string): FocusSession | null {
  const s = store.find((ss) => ss.id === id);
  if (!s || s.status !== "focusing") return null;
  s.status = "break";
  s.pomodoros_completed++;
  return s;
}

export function endSession(id: string): FocusSession | null {
  const s = store.find((ss) => ss.id === id);
  if (!s) return null;
  s.status = "idle";
  s.completed_at = new Date().toISOString();
  return s;
}

export function focusStats(userId: string): { total_sessions: number; total_pomodoros: number; total_focus_minutes: number } {
  const sessions = store.filter((s) => s.user_id === userId);
  return {
    total_sessions: sessions.length,
    total_pomodoros: sessions.reduce((sum, s) => sum + s.pomodoros_completed, 0),
    total_focus_minutes: sessions.filter((s) => s.completed_at).reduce((sum, s) => sum + s.duration_minutes * s.pomodoros_completed, 0),
  };
}

export function activeSession(userId: string): FocusSession | null {
  return store.find((s) => s.user_id === userId && s.status === "focusing") || null;
}
