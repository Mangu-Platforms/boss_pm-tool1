export type SubscriptionLevel = "all" | "mentions" | "status_changes" | "none";

export type IssueSubscription = {
  id: string;
  user_id: string;
  issue_id: string;
  level: SubscriptionLevel;
  created_at: string;
};

let nextId = 6;
function genId() { return `sub-${nextId++}`; }

const store: IssueSubscription[] = [
  { id: "sub-1", user_id: "max", issue_id: "BOSS-1", level: "all", created_at: "2025-03-01T10:00:00Z" },
  { id: "sub-2", user_id: "alice", issue_id: "BOSS-1", level: "mentions", created_at: "2025-03-01T10:00:00Z" },
  { id: "sub-3", user_id: "max", issue_id: "BOSS-2", level: "status_changes", created_at: "2025-03-02T10:00:00Z" },
  { id: "sub-4", user_id: "bob", issue_id: "BOSS-3", level: "all", created_at: "2025-03-03T10:00:00Z" },
  { id: "sub-5", user_id: "alice", issue_id: "BOSS-2", level: "all", created_at: "2025-03-04T10:00:00Z" },
];

export function subscriptionsForIssue(issueId: string): IssueSubscription[] {
  return store.filter((s) => s.issue_id === issueId);
}

export function subscriptionsForUser(userId: string): IssueSubscription[] {
  return store.filter((s) => s.user_id === userId);
}

export function getSubscription(userId: string, issueId: string): IssueSubscription | null {
  return store.find((s) => s.user_id === userId && s.issue_id === issueId) || null;
}

export function subscribe(userId: string, issueId: string, level: SubscriptionLevel = "all"): IssueSubscription {
  const existing = store.find((s) => s.user_id === userId && s.issue_id === issueId);
  if (existing) {
    existing.level = level;
    return existing;
  }
  const sub: IssueSubscription = { id: genId(), user_id: userId, issue_id: issueId, level, created_at: new Date().toISOString() };
  store.push(sub);
  return sub;
}

export function unsubscribe(userId: string, issueId: string): boolean {
  const idx = store.findIndex((s) => s.user_id === userId && s.issue_id === issueId);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function subscriberCount(issueId: string): number {
  return store.filter((s) => s.issue_id === issueId && s.level !== "none").length;
}
