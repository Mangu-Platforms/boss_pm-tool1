export type WatchReason = "creator" | "assignee" | "mentioned" | "subscribed" | "manual";

export type IssueWatcher = {
  id: string;
  issue_id: string;
  user_id: string;
  reason: WatchReason;
  created_at: string;
};

let nextId = 6;
function genId() { return `watch-${nextId++}`; }

const store: IssueWatcher[] = [
  { id: "watch-1", issue_id: "BOSS-1", user_id: "max", reason: "creator", created_at: "2025-03-01T10:00:00Z" },
  { id: "watch-2", issue_id: "BOSS-1", user_id: "alice", reason: "assignee", created_at: "2025-03-01T10:00:00Z" },
  { id: "watch-3", issue_id: "BOSS-2", user_id: "max", reason: "creator", created_at: "2025-03-02T10:00:00Z" },
  { id: "watch-4", issue_id: "BOSS-3", user_id: "bob", reason: "subscribed", created_at: "2025-03-05T10:00:00Z" },
  { id: "watch-5", issue_id: "BOSS-2", user_id: "alice", reason: "mentioned", created_at: "2025-03-06T10:00:00Z" },
];

export function listWatchers(issueId: string): IssueWatcher[] {
  return store.filter((w) => w.issue_id === issueId);
}

export function watchersForUser(userId: string): IssueWatcher[] {
  return store.filter((w) => w.user_id === userId);
}

export function isWatching(issueId: string, userId: string): boolean {
  return store.some((w) => w.issue_id === issueId && w.user_id === userId);
}

export function watchIssue(issueId: string, userId: string, reason: WatchReason = "manual"): IssueWatcher {
  const existing = store.find((w) => w.issue_id === issueId && w.user_id === userId);
  if (existing) return existing;
  const watcher: IssueWatcher = { id: genId(), issue_id: issueId, user_id: userId, reason, created_at: new Date().toISOString() };
  store.push(watcher);
  return watcher;
}

export function unwatchIssue(issueId: string, userId: string): boolean {
  const idx = store.findIndex((w) => w.issue_id === issueId && w.user_id === userId);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function watcherCount(issueId: string): number {
  return store.filter((w) => w.issue_id === issueId).length;
}
