export type TimeEntry = {
  id: string;
  issue_id: string;
  minutes: number;
  note: string;
  author: string;
  logged_at: string;
};

const store: TimeEntry[] = [];

export function logTime(issueId: string, minutes: number, note: string, author = "operator"): TimeEntry {
  const entry: TimeEntry = {
    id: crypto.randomUUID(),
    issue_id: issueId,
    minutes,
    note,
    author,
    logged_at: new Date().toISOString(),
  };
  store.push(entry);
  return entry;
}

export function listTimeEntries(issueId: string): TimeEntry[] {
  return store.filter((e) => e.issue_id === issueId).sort((a, b) => b.logged_at.localeCompare(a.logged_at));
}

export function totalMinutes(issueId: string): number {
  return store.filter((e) => e.issue_id === issueId).reduce((sum, e) => sum + e.minutes, 0);
}

export function removeTimeEntry(id: string): boolean {
  const idx = store.findIndex((e) => e.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function allTimeEntries(): TimeEntry[] {
  return [...store].sort((a, b) => b.logged_at.localeCompare(a.logged_at));
}
