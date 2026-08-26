export type TimeEntry = {
  id: string;
  issue_id: string;
  member: string;
  hours: number;
  description: string;
  date: string;
  created_at: string;
};

const entries: TimeEntry[] = [
  { id: "te-1", issue_id: "BOSS-1", member: "alice", hours: 3, description: "API design and initial implementation", date: "2025-03-08", created_at: "2025-03-08T10:00:00.000Z" },
  { id: "te-2", issue_id: "BOSS-1", member: "bob", hours: 2, description: "Review and test fixes", date: "2025-03-08", created_at: "2025-03-08T14:00:00.000Z" },
  { id: "te-3", issue_id: "BOSS-2", member: "alice", hours: 5, description: "Frontend dashboard work", date: "2025-03-09", created_at: "2025-03-09T09:00:00.000Z" },
  { id: "te-4", issue_id: "BOSS-3", member: "carol", hours: 1.5, description: "Bug investigation", date: "2025-03-09", created_at: "2025-03-09T11:00:00.000Z" },
];

export function listTimeEntries(filters?: { issue_id?: string; member?: string; from?: string; to?: string }): TimeEntry[] {
  let items = [...entries];
  if (filters?.issue_id) items = items.filter((e) => e.issue_id === filters.issue_id);
  if (filters?.member) items = items.filter((e) => e.member === filters.member);
  if (filters?.from) items = items.filter((e) => e.date >= filters.from!);
  if (filters?.to) items = items.filter((e) => e.date <= filters.to!);
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export function getTimeEntry(id: string): TimeEntry | null {
  return entries.find((e) => e.id === id) || null;
}

export function createTimeEntry(issueId: string, member: string, hours: number, description: string, date: string): TimeEntry {
  const entry: TimeEntry = {
    id: `te-${crypto.randomUUID().slice(0, 8)}`,
    issue_id: issueId,
    member,
    hours,
    description,
    date,
    created_at: new Date().toISOString(),
  };
  entries.push(entry);
  return entry;
}

export function deleteTimeEntry(id: string): boolean {
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  entries.splice(idx, 1);
  return true;
}

export function totalHours(issueId?: string): number {
  const items = issueId ? entries.filter((e) => e.issue_id === issueId) : entries;
  return items.reduce((sum, e) => sum + e.hours, 0);
}

export function hoursByMember(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const e of entries) {
    result[e.member] = (result[e.member] || 0) + e.hours;
  }
  return result;
}
