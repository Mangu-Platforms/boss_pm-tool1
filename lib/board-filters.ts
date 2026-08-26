export type FilterOperator = "eq" | "neq" | "contains" | "in" | "gt" | "lt";

export type FilterCondition = {
  field: string;
  operator: FilterOperator;
  value: string;
};

export type BoardFilter = {
  id: string;
  name: string;
  owner: string;
  conditions: FilterCondition[];
  is_shared: boolean;
  created_at: string;
};

let nextId = 5;
function genId() { return `filter-${nextId++}`; }

const store: BoardFilter[] = [
  {
    id: "filter-1", name: "My Open Issues", owner: "max",
    conditions: [{ field: "assignee_user", operator: "eq", value: "max" }, { field: "status", operator: "neq", value: "done" }],
    is_shared: false, created_at: "2025-03-01T10:00:00Z",
  },
  {
    id: "filter-2", name: "Critical Bugs", owner: "max",
    conditions: [{ field: "priority", operator: "eq", value: "critical" }],
    is_shared: true, created_at: "2025-03-05T10:00:00Z",
  },
  {
    id: "filter-3", name: "Overdue Items", owner: "alice",
    conditions: [{ field: "status", operator: "neq", value: "done" }],
    is_shared: true, created_at: "2025-03-10T10:00:00Z",
  },
  {
    id: "filter-4", name: "Unassigned Backlog", owner: "bob",
    conditions: [{ field: "status", operator: "eq", value: "backlog" }],
    is_shared: false, created_at: "2025-03-12T10:00:00Z",
  },
];

export function listFilters(owner?: string): BoardFilter[] {
  if (owner) return store.filter((f) => f.owner === owner || f.is_shared);
  return [...store];
}

export function getFilter(id: string): BoardFilter | null {
  return store.find((f) => f.id === id) || null;
}

export function createFilter(name: string, owner: string, conditions: FilterCondition[], isShared: boolean = false): BoardFilter {
  const filter: BoardFilter = { id: genId(), name, owner, conditions, is_shared: isShared, created_at: new Date().toISOString() };
  store.push(filter);
  return filter;
}

export function updateFilter(id: string, updates: Partial<Pick<BoardFilter, "name" | "conditions" | "is_shared">>): BoardFilter | null {
  const f = store.find((fl) => fl.id === id);
  if (!f) return null;
  if (updates.name !== undefined) f.name = updates.name;
  if (updates.conditions !== undefined) f.conditions = updates.conditions;
  if (updates.is_shared !== undefined) f.is_shared = updates.is_shared;
  return f;
}

export function deleteFilter(id: string): boolean {
  const idx = store.findIndex((f) => f.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function sharedFilters(): BoardFilter[] {
  return store.filter((f) => f.is_shared);
}
