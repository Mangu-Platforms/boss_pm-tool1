export type Allocation = {
  id: string;
  member: string;
  project: string;
  percentage: number;
  start_date: string;
  end_date: string | null;
};

export type CapacityEntry = {
  member: string;
  total_hours: number;
  allocated_hours: number;
  available_hours: number;
};

const store: Allocation[] = [
  { id: "alloc-1", member: "Max", project: "Boss PM", percentage: 60, start_date: "2025-03-01", end_date: null },
  { id: "alloc-2", member: "Max", project: "Infrastructure", percentage: 20, start_date: "2025-03-01", end_date: null },
  { id: "alloc-3", member: "Alice", project: "Boss PM", percentage: 80, start_date: "2025-03-01", end_date: null },
  { id: "alloc-4", member: "Bob", project: "Boss PM", percentage: 50, start_date: "2025-03-01", end_date: null },
  { id: "alloc-5", member: "Bob", project: "Client Portal", percentage: 40, start_date: "2025-03-01", end_date: null },
];

const HOURS_PER_WEEK = 40;

export function listAllocations(): Allocation[] {
  return [...store];
}

export function getAllocationsForMember(member: string): Allocation[] {
  return store.filter((a) => a.member.toLowerCase() === member.toLowerCase());
}

export function getAllocationsForProject(project: string): Allocation[] {
  return store.filter((a) => a.project.toLowerCase() === project.toLowerCase());
}

export function createAllocation(member: string, project: string, percentage: number, startDate: string, endDate: string | null = null): Allocation {
  const alloc: Allocation = {
    id: `alloc-${crypto.randomUUID().slice(0, 8)}`,
    member,
    project,
    percentage: Math.min(100, Math.max(0, percentage)),
    start_date: startDate,
    end_date: endDate,
  };
  store.push(alloc);
  return alloc;
}

export function updateAllocation(id: string, updates: Partial<Pick<Allocation, "percentage" | "end_date">>): Allocation | null {
  const alloc = store.find((a) => a.id === id);
  if (!alloc) return null;
  if (updates.percentage !== undefined) alloc.percentage = Math.min(100, Math.max(0, updates.percentage));
  if (updates.end_date !== undefined) alloc.end_date = updates.end_date;
  return alloc;
}

export function deleteAllocation(id: string): boolean {
  const idx = store.findIndex((a) => a.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function getCapacitySummary(): CapacityEntry[] {
  const members = [...new Set(store.map((a) => a.member))];
  return members.map((member) => {
    const allocs = store.filter((a) => a.member === member);
    const totalPct = allocs.reduce((sum, a) => sum + a.percentage, 0);
    const allocatedHours = (totalPct / 100) * HOURS_PER_WEEK;
    return {
      member,
      total_hours: HOURS_PER_WEEK,
      allocated_hours: Math.round(allocatedHours * 10) / 10,
      available_hours: Math.round((HOURS_PER_WEEK - allocatedHours) * 10) / 10,
    };
  });
}

export function isOverallocated(member: string): boolean {
  const allocs = store.filter((a) => a.member.toLowerCase() === member.toLowerCase());
  const totalPct = allocs.reduce((sum, a) => sum + a.percentage, 0);
  return totalPct > 100;
}
