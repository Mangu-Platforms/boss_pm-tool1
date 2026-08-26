export type Bookmark = {
  id: string;
  user: string;
  entity_type: "issue" | "product" | "wiki" | "risk" | "goal" | "epic";
  entity_id: string;
  label: string;
  created_at: string;
};

const store: Bookmark[] = [
  { id: "bm-1", user: "Max", entity_type: "issue", entity_id: "BOSS-1", label: "Build MVP dashboard", created_at: "2025-02-01T00:00:00.000Z" },
  { id: "bm-2", user: "Max", entity_type: "goal", entity_id: "goal-revenue", label: "Revenue target", created_at: "2025-02-05T00:00:00.000Z" },
  { id: "bm-3", user: "Alice", entity_type: "wiki", entity_id: "wiki-getting-started", label: "Getting Started guide", created_at: "2025-02-10T00:00:00.000Z" },
];

export function listBookmarks(user?: string): Bookmark[] {
  let items = [...store];
  if (user) items = items.filter((b) => b.user.toLowerCase() === user.toLowerCase());
  return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function createBookmark(user: string, entityType: Bookmark["entity_type"], entityId: string, label: string): Bookmark {
  const existing = store.find((b) => b.user.toLowerCase() === user.toLowerCase() && b.entity_id === entityId);
  if (existing) return existing;
  const bm: Bookmark = {
    id: `bm-${crypto.randomUUID().slice(0, 8)}`,
    user,
    entity_type: entityType,
    entity_id: entityId,
    label: label.trim(),
    created_at: new Date().toISOString(),
  };
  store.push(bm);
  return bm;
}

export function deleteBookmark(id: string): boolean {
  const idx = store.findIndex((b) => b.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function isBookmarked(user: string, entityId: string): boolean {
  return store.some((b) => b.user.toLowerCase() === user.toLowerCase() && b.entity_id === entityId);
}
