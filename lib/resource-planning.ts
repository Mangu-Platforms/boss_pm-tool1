export type ResourceAllocation = {
  id: string;
  member: string;
  project_id: string;
  allocation_pct: number;
  start_date: string;
  end_date: string;
  notes: string;
  created_at: string;
};

let nextId = 5;
function genId() { return `ra-${nextId++}`; }

const store: ResourceAllocation[] = [
  { id: "ra-1", member: "max", project_id: "boss-wallet", allocation_pct: 60, start_date: "2025-03-01", end_date: "2025-06-30", notes: "Lead developer", created_at: "2025-02-15T10:00:00Z" },
  { id: "ra-2", member: "alice", project_id: "boss-wallet", allocation_pct: 40, start_date: "2025-03-01", end_date: "2025-06-30", notes: "Agent ops", created_at: "2025-02-15T10:00:00Z" },
  { id: "ra-3", member: "max", project_id: "boss-pm", allocation_pct: 40, start_date: "2025-03-01", end_date: "2025-06-30", notes: "PM tool dev", created_at: "2025-02-15T10:00:00Z" },
  { id: "ra-4", member: "bob", project_id: "boss-pm", allocation_pct: 80, start_date: "2025-04-01", end_date: "2025-09-30", notes: "Full-time", created_at: "2025-03-20T10:00:00Z" },
];

export function listAllocations(member?: string, projectId?: string): ResourceAllocation[] {
  let result = [...store];
  if (member) result = result.filter((a) => a.member === member);
  if (projectId) result = result.filter((a) => a.project_id === projectId);
  return result;
}

export function getAllocation(id: string): ResourceAllocation | null {
  return store.find((a) => a.id === id) || null;
}

export function createAllocation(member: string, projectId: string, allocationPct: number, startDate: string, endDate: string, notes = ""): ResourceAllocation {
  const a: ResourceAllocation = { id: genId(), member, project_id: projectId, allocation_pct: allocationPct, start_date: startDate, end_date: endDate, notes, created_at: new Date().toISOString() };
  store.push(a);
  return a;
}

export function updateAllocation(id: string, updates: Partial<Pick<ResourceAllocation, "allocation_pct" | "start_date" | "end_date" | "notes">>): ResourceAllocation | null {
  const a = store.find((al) => al.id === id);
  if (!a) return null;
  if (updates.allocation_pct !== undefined) a.allocation_pct = updates.allocation_pct;
  if (updates.start_date !== undefined) a.start_date = updates.start_date;
  if (updates.end_date !== undefined) a.end_date = updates.end_date;
  if (updates.notes !== undefined) a.notes = updates.notes;
  return a;
}

export function deleteAllocation(id: string): boolean {
  const idx = store.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function memberUtilization(member: string): number {
  const allocs = store.filter((a) => a.member === member);
  return allocs.reduce((sum, a) => sum + a.allocation_pct, 0);
}

export function overAllocatedMembers(): { member: string; total_pct: number }[] {
  const byMember: Record<string, number> = {};
  for (const a of store) {
    byMember[a.member] = (byMember[a.member] || 0) + a.allocation_pct;
  }
  return Object.entries(byMember)
    .filter(([, pct]) => pct > 100)
    .map(([member, total_pct]) => ({ member, total_pct }));
}
