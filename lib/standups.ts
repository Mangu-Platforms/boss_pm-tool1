export type StandupEntry = {
  id: string;
  member: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
  created_at: string;
};

const store: StandupEntry[] = [
  {
    id: "su-1",
    member: "Max",
    date: "2025-03-10",
    yesterday: "Finished dashboard layout and API wiring",
    today: "Building risk register and retros modules",
    blockers: "None",
    created_at: "2025-03-10T09:00:00.000Z",
  },
  {
    id: "su-2",
    member: "Alice",
    date: "2025-03-10",
    yesterday: "Code review on sprint module PR",
    today: "Implementing SLA tracker alerts",
    blockers: "Waiting on design specs for notification preferences",
    created_at: "2025-03-10T09:05:00.000Z",
  },
  {
    id: "su-3",
    member: "Bob",
    date: "2025-03-10",
    yesterday: "Fixed CSV import parsing edge cases",
    today: "Writing tests for dependency graph cycle detection",
    blockers: "None",
    created_at: "2025-03-10T09:02:00.000Z",
  },
];

export function listStandups(date?: string): StandupEntry[] {
  let items = [...store];
  if (date) items = items.filter((s) => s.date === date);
  return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getStandup(id: string): StandupEntry | null {
  return store.find((s) => s.id === id) || null;
}

export function createStandup(member: string, yesterday: string, today: string, blockers = "", date?: string): StandupEntry {
  const entry: StandupEntry = {
    id: `su-${crypto.randomUUID().slice(0, 8)}`,
    member,
    date: date || new Date().toISOString().slice(0, 10),
    yesterday,
    today,
    blockers,
    created_at: new Date().toISOString(),
  };
  store.push(entry);
  return entry;
}

export function deleteStandup(id: string): boolean {
  const idx = store.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function getStandupDates(): string[] {
  const dates = [...new Set(store.map((s) => s.date))];
  return dates.sort((a, b) => b.localeCompare(a));
}
