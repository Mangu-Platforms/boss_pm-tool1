export type Release = {
  id: string;
  version: string;
  title: string;
  notes: string;
  issue_ids: string[];
  published: boolean;
  published_at: string | null;
  created_at: string;
};

const store: Release[] = [
  {
    id: "rel-0.1",
    version: "0.1.0",
    title: "Initial Preview",
    notes: "First preview release with core issue management, Kanban board, and agent assignment.",
    issue_ids: [],
    published: true,
    published_at: "2025-06-01T00:00:00Z",
    created_at: "2025-06-01T00:00:00Z",
  },
];

export function listReleases(): Release[] {
  return [...store].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getRelease(id: string): Release | null {
  return store.find((r) => r.id === id) || null;
}

export function createRelease(version: string, title: string, notes: string, issueIds: string[] = []): Release {
  const release: Release = {
    id: crypto.randomUUID(),
    version,
    title,
    notes,
    issue_ids: issueIds,
    published: false,
    published_at: null,
    created_at: new Date().toISOString(),
  };
  store.push(release);
  return release;
}

export function updateRelease(id: string, updates: Partial<Pick<Release, "version" | "title" | "notes" | "issue_ids">>): Release | null {
  const release = store.find((r) => r.id === id);
  if (!release) return null;
  if (updates.version !== undefined) release.version = updates.version;
  if (updates.title !== undefined) release.title = updates.title;
  if (updates.notes !== undefined) release.notes = updates.notes;
  if (updates.issue_ids !== undefined) release.issue_ids = updates.issue_ids;
  return release;
}

export function publishRelease(id: string): Release | null {
  const release = store.find((r) => r.id === id);
  if (!release) return null;
  release.published = true;
  release.published_at = new Date().toISOString();
  return release;
}

export function deleteRelease(id: string): boolean {
  const idx = store.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function addIssueToRelease(releaseId: string, issueId: string): boolean {
  const release = store.find((r) => r.id === releaseId);
  if (!release) return false;
  if (!release.issue_ids.includes(issueId)) {
    release.issue_ids.push(issueId);
  }
  return true;
}

export function removeIssueFromRelease(releaseId: string, issueId: string): boolean {
  const release = store.find((r) => r.id === releaseId);
  if (!release) return false;
  release.issue_ids = release.issue_ids.filter((id) => id !== issueId);
  return true;
}
