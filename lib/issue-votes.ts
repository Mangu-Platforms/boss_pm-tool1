export type ReactionType = "thumbsup" | "thumbsdown" | "heart" | "rocket" | "eyes" | "fire";

export type IssueVote = {
  id: string;
  issue_id: string;
  user_id: string;
  reaction: ReactionType;
  created_at: string;
};

let nextId = 7;
function genId() { return `vote-${nextId++}`; }

const store: IssueVote[] = [
  { id: "vote-1", issue_id: "BOSS-1", user_id: "max", reaction: "thumbsup", created_at: "2025-03-01T10:00:00Z" },
  { id: "vote-2", issue_id: "BOSS-1", user_id: "alice", reaction: "thumbsup", created_at: "2025-03-01T11:00:00Z" },
  { id: "vote-3", issue_id: "BOSS-1", user_id: "bob", reaction: "heart", created_at: "2025-03-02T10:00:00Z" },
  { id: "vote-4", issue_id: "BOSS-2", user_id: "max", reaction: "rocket", created_at: "2025-03-03T10:00:00Z" },
  { id: "vote-5", issue_id: "BOSS-3", user_id: "alice", reaction: "eyes", created_at: "2025-03-04T10:00:00Z" },
  { id: "vote-6", issue_id: "BOSS-2", user_id: "bob", reaction: "fire", created_at: "2025-03-05T10:00:00Z" },
];

export function votesForIssue(issueId: string): IssueVote[] {
  return store.filter((v) => v.issue_id === issueId);
}

export function addVote(issueId: string, userId: string, reaction: ReactionType): IssueVote {
  const existing = store.find((v) => v.issue_id === issueId && v.user_id === userId && v.reaction === reaction);
  if (existing) return existing;
  const vote: IssueVote = { id: genId(), issue_id: issueId, user_id: userId, reaction, created_at: new Date().toISOString() };
  store.push(vote);
  return vote;
}

export function removeVote(issueId: string, userId: string, reaction: ReactionType): boolean {
  const idx = store.findIndex((v) => v.issue_id === issueId && v.user_id === userId && v.reaction === reaction);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function reactionSummary(issueId: string): Record<ReactionType, number> {
  const summary: Record<string, number> = { thumbsup: 0, thumbsdown: 0, heart: 0, rocket: 0, eyes: 0, fire: 0 };
  store.filter((v) => v.issue_id === issueId).forEach((v) => { summary[v.reaction]++; });
  return summary as Record<ReactionType, number>;
}

export function topVotedIssues(limit: number = 10): { issue_id: string; total: number }[] {
  const counts: Record<string, number> = {};
  store.forEach((v) => { counts[v.issue_id] = (counts[v.issue_id] || 0) + 1; });
  return Object.entries(counts)
    .map(([issue_id, total]) => ({ issue_id, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function userVotes(userId: string): IssueVote[] {
  return store.filter((v) => v.user_id === userId);
}
