export type ReleaseNote = {
  id: string;
  version: string;
  title: string;
  body: string;
  category: "feature" | "bugfix" | "improvement" | "breaking";
  release_id: string | null;
  published: boolean;
  created_at: string;
};

let nextId = 4;
function genId() { return `rn-${nextId++}`; }

const store: ReleaseNote[] = [
  { id: "rn-1", version: "1.0.0", title: "Initial release", body: "First public release of Boss PM Tool.", category: "feature", release_id: "rel-1", published: true, created_at: "2025-02-01T10:00:00Z" },
  { id: "rn-2", version: "1.1.0", title: "Sprint management", body: "Added sprint planning and tracking.", category: "feature", release_id: "rel-2", published: true, created_at: "2025-03-01T10:00:00Z" },
  { id: "rn-3", version: "1.1.1", title: "Fix priority sorting", body: "Fixed issue where priority sorting was reversed.", category: "bugfix", release_id: "rel-2", published: false, created_at: "2025-03-15T10:00:00Z" },
];

export function listReleaseNotes(version?: string): ReleaseNote[] {
  if (version) return store.filter((n) => n.version === version);
  return [...store];
}

export function getReleaseNote(id: string): ReleaseNote | null {
  return store.find((n) => n.id === id) || null;
}

export function createReleaseNote(version: string, title: string, body: string, category: ReleaseNote["category"], releaseId?: string): ReleaseNote {
  const rn: ReleaseNote = { id: genId(), version, title, body, category, release_id: releaseId || null, published: false, created_at: new Date().toISOString() };
  store.push(rn);
  return rn;
}

export function updateReleaseNote(id: string, updates: Partial<Pick<ReleaseNote, "title" | "body" | "category" | "published">>): ReleaseNote | null {
  const rn = store.find((n) => n.id === id);
  if (!rn) return null;
  if (updates.title !== undefined) rn.title = updates.title;
  if (updates.body !== undefined) rn.body = updates.body;
  if (updates.category !== undefined) rn.category = updates.category;
  if (updates.published !== undefined) rn.published = updates.published;
  return rn;
}

export function publishReleaseNote(id: string): ReleaseNote | null {
  const rn = store.find((n) => n.id === id);
  if (!rn) return null;
  rn.published = true;
  return rn;
}

export function deleteReleaseNote(id: string): boolean {
  const idx = store.findIndex((n) => n.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}
