export type MentionContext = "comment" | "description" | "standup" | "retro" | "wiki";

export type IssueMention = {
  id: string;
  issue_id: string;
  mentioned_by: string;
  context: MentionContext;
  source_id: string;
  snippet: string;
  created_at: string;
};

let nextId = 7;
function genId() { return `mention-${nextId++}`; }

const store: IssueMention[] = [
  { id: "mention-1", issue_id: "BOSS-1", mentioned_by: "max", context: "comment", source_id: "cmt-1", snippet: "Related to BOSS-1 setup", created_at: "2025-03-01T10:00:00Z" },
  { id: "mention-2", issue_id: "BOSS-1", mentioned_by: "alice", context: "standup", source_id: "standup-1", snippet: "Working on BOSS-1 today", created_at: "2025-03-02T10:00:00Z" },
  { id: "mention-3", issue_id: "BOSS-2", mentioned_by: "bob", context: "wiki", source_id: "wiki-1", snippet: "See BOSS-2 for details", created_at: "2025-03-03T10:00:00Z" },
  { id: "mention-4", issue_id: "BOSS-3", mentioned_by: "max", context: "retro", source_id: "retro-1", snippet: "BOSS-3 was challenging", created_at: "2025-03-05T10:00:00Z" },
  { id: "mention-5", issue_id: "BOSS-1", mentioned_by: "bob", context: "description", source_id: "BOSS-5", snippet: "Depends on BOSS-1", created_at: "2025-03-06T10:00:00Z" },
  { id: "mention-6", issue_id: "BOSS-2", mentioned_by: "alice", context: "comment", source_id: "cmt-3", snippet: "Blocking BOSS-2", created_at: "2025-03-07T10:00:00Z" },
];

export function mentionsForIssue(issueId: string): IssueMention[] {
  return store.filter((m) => m.issue_id === issueId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function mentionsByUser(userId: string): IssueMention[] {
  return store.filter((m) => m.mentioned_by === userId);
}

export function addMention(issueId: string, mentionedBy: string, context: MentionContext, sourceId: string, snippet: string): IssueMention {
  const mention: IssueMention = { id: genId(), issue_id: issueId, mentioned_by: mentionedBy, context, source_id: sourceId, snippet, created_at: new Date().toISOString() };
  store.push(mention);
  return mention;
}

export function mentionCount(issueId: string): number {
  return store.filter((m) => m.issue_id === issueId).length;
}

export function recentMentions(limit: number = 10): IssueMention[] {
  return [...store].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
}

export function mentionsByContext(context: MentionContext): IssueMention[] {
  return store.filter((m) => m.context === context);
}
