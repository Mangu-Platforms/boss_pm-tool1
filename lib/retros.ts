export type RetroItem = {
  id: string;
  type: "went_well" | "to_improve" | "action_item";
  text: string;
  votes: number;
  author: string;
  resolved: boolean;
};

export type Retrospective = {
  id: string;
  title: string;
  sprint_id: string | null;
  items: RetroItem[];
  status: "open" | "in_progress" | "completed";
  created_at: string;
};

const store: Retrospective[] = [
  {
    id: "retro-1",
    title: "Sprint 1 Retro",
    sprint_id: "sprint-1",
    items: [
      { id: "ri-1", type: "went_well", text: "Good team communication", votes: 3, author: "Max", resolved: false },
      { id: "ri-2", type: "to_improve", text: "Too many meetings", votes: 5, author: "Alice", resolved: false },
      { id: "ri-3", type: "action_item", text: "Reduce standups to 3x/week", votes: 4, author: "Bob", resolved: true },
    ],
    status: "completed",
    created_at: "2025-02-15T00:00:00.000Z",
  },
];

export function listRetros(): Retrospective[] {
  return [...store].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getRetro(id: string): Retrospective | null {
  return store.find((r) => r.id === id) || null;
}

export function createRetro(title: string, sprintId: string | null = null): Retrospective {
  const retro: Retrospective = {
    id: `retro-${crypto.randomUUID().slice(0, 8)}`,
    title: title.trim(),
    sprint_id: sprintId,
    items: [],
    status: "open",
    created_at: new Date().toISOString(),
  };
  store.push(retro);
  return retro;
}

export function addRetroItem(retroId: string, type: RetroItem["type"], text: string, author = "operator"): RetroItem | null {
  const retro = store.find((r) => r.id === retroId);
  if (!retro) return null;
  const item: RetroItem = {
    id: `ri-${crypto.randomUUID().slice(0, 8)}`,
    type,
    text: text.trim(),
    votes: 0,
    author,
    resolved: false,
  };
  retro.items.push(item);
  return item;
}

export function voteRetroItem(retroId: string, itemId: string): boolean {
  const retro = store.find((r) => r.id === retroId);
  if (!retro) return false;
  const item = retro.items.find((i) => i.id === itemId);
  if (!item) return false;
  item.votes++;
  return true;
}

export function resolveRetroItem(retroId: string, itemId: string): boolean {
  const retro = store.find((r) => r.id === retroId);
  if (!retro) return false;
  const item = retro.items.find((i) => i.id === itemId);
  if (!item) return false;
  item.resolved = true;
  return true;
}

export function updateRetroStatus(retroId: string, status: Retrospective["status"]): Retrospective | null {
  const retro = store.find((r) => r.id === retroId);
  if (!retro) return null;
  retro.status = status;
  return retro;
}

export function deleteRetro(id: string): boolean {
  const idx = store.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}
