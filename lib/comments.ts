export type Comment = {
  id: string;
  issue_id: string;
  author: string;
  body: string;
  created_at: string;
};

const store: Comment[] = [
  { id: "cmt-1", issue_id: "BOSS-1", author: "alice", body: "Started working on the API design. Initial endpoints drafted.", created_at: "2025-03-08T10:00:00.000Z" },
  { id: "cmt-2", issue_id: "BOSS-1", author: "bob", body: "Looks good! Couple of suggestions on error handling.", created_at: "2025-03-08T14:00:00.000Z" },
  { id: "cmt-3", issue_id: "BOSS-2", author: "carol", body: "Dashboard mockups ready for review.", created_at: "2025-03-09T09:00:00.000Z" },
];

export function listAllComments(): Comment[] {
  return [...store].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getComment(id: string): Comment | null {
  return store.find((c) => c.id === id) || null;
}

export function addComment(issue_id: string, body: string, author = "operator"): Comment {
  if (!body.trim()) throw new Error("body required");
  const comment: Comment = {
    id: crypto.randomUUID(),
    issue_id,
    author,
    body: body.trim(),
    created_at: new Date().toISOString(),
  };
  store.push(comment);
  return comment;
}

export function listComments(issue_id: string): Comment[] {
  return store
    .filter((c) => c.issue_id === issue_id)
    .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
}

export function deleteComment(id: string): boolean {
  const idx = store.findIndex((c) => c.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}
