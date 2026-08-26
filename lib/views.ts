export type SavedView = {
  id: string;
  name: string;
  filters: {
    product?: string;
    status?: string;
    assignee?: string;
    priority?: string;
    label?: string;
  };
  sort?: string;
  created_at: string;
};

const store: SavedView[] = [
  {
    id: "view-my-open",
    name: "My open issues",
    filters: { status: "open", assignee: "user" },
    sort: "priority",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "view-agent-doing",
    name: "Agent in-progress",
    filters: { status: "doing", assignee: "agent" },
    sort: "created",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "view-critical",
    name: "Critical priority",
    filters: { priority: "critical" },
    sort: "created",
    created_at: "2025-01-01T00:00:00Z",
  },
];

export function listViews(): SavedView[] {
  return [...store].sort((a, b) => a.name.localeCompare(b.name));
}

export function createView(name: string, filters: SavedView["filters"], sort?: string): SavedView {
  const view: SavedView = {
    id: crypto.randomUUID(),
    name,
    filters,
    sort,
    created_at: new Date().toISOString(),
  };
  store.push(view);
  return view;
}

export function deleteView(id: string): boolean {
  const idx = store.findIndex((v) => v.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function getView(id: string): SavedView | null {
  return store.find((v) => v.id === id) || null;
}
