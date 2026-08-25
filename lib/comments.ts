export type Comment = {
  id: string;
  issue_id: string;
  author: string;
  body: string;
  created_at: string;
};

const store: Comment[] = [];

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
