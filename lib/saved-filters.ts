export type FilterCondition = {
  field: string;
  operator: "eq" | "neq" | "contains" | "gt" | "lt" | "in";
  value: string | number | string[];
};

export type SavedFilter = {
  id: string;
  name: string;
  entity: "issues" | "products" | "milestones" | "sprints";
  conditions: FilterCondition[];
  owner: string;
  is_shared: boolean;
  created_at: string;
};

let nextId = 4;
function genId() { return `sf-${nextId++}`; }

const store: SavedFilter[] = [
  {
    id: "sf-1", name: "My Open Issues", entity: "issues",
    conditions: [{ field: "status", operator: "in", value: ["open", "doing"] }, { field: "assignee_user", operator: "eq", value: "max" }],
    owner: "max", is_shared: false, created_at: "2025-03-01T10:00:00Z",
  },
  {
    id: "sf-2", name: "Critical Bugs", entity: "issues",
    conditions: [{ field: "priority", operator: "eq", value: "critical" }],
    owner: "max", is_shared: true, created_at: "2025-03-05T12:00:00Z",
  },
  {
    id: "sf-3", name: "Active Milestones", entity: "milestones",
    conditions: [{ field: "status", operator: "eq", value: "active" }],
    owner: "alice", is_shared: true, created_at: "2025-03-10T14:00:00Z",
  },
];

export function listSavedFilters(owner?: string): SavedFilter[] {
  if (owner) return store.filter((f) => f.owner === owner || f.is_shared);
  return [...store];
}

export function getSavedFilter(id: string): SavedFilter | null {
  return store.find((f) => f.id === id) || null;
}

export function createSavedFilter(
  name: string, entity: SavedFilter["entity"], conditions: FilterCondition[], owner: string, isShared = false
): SavedFilter {
  const sf: SavedFilter = { id: genId(), name, entity, conditions, owner, is_shared: isShared, created_at: new Date().toISOString() };
  store.push(sf);
  return sf;
}

export function updateSavedFilter(id: string, updates: Partial<Pick<SavedFilter, "name" | "conditions" | "is_shared">>): SavedFilter | null {
  const sf = store.find((f) => f.id === id);
  if (!sf) return null;
  if (updates.name !== undefined) sf.name = updates.name;
  if (updates.conditions !== undefined) sf.conditions = updates.conditions;
  if (updates.is_shared !== undefined) sf.is_shared = updates.is_shared;
  return sf;
}

export function deleteSavedFilter(id: string): boolean {
  const idx = store.findIndex((f) => f.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}
