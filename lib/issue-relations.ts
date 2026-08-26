export type RelationType = "parent" | "child" | "duplicate" | "related" | "cloned_from";

export type IssueRelation = {
  id: string;
  source_issue_id: string;
  target_issue_id: string;
  type: RelationType;
  created_at: string;
};

let nextId = 4;
function genId() { return `rel-${nextId++}`; }

const store: IssueRelation[] = [
  { id: "rel-1", source_issue_id: "ISS-1", target_issue_id: "ISS-3", type: "parent", created_at: "2025-03-01T10:00:00Z" },
  { id: "rel-2", source_issue_id: "ISS-3", target_issue_id: "ISS-1", type: "child", created_at: "2025-03-01T10:00:00Z" },
  { id: "rel-3", source_issue_id: "ISS-2", target_issue_id: "ISS-4", type: "related", created_at: "2025-03-05T10:00:00Z" },
];

export function listRelations(issueId?: string): IssueRelation[] {
  if (issueId) return store.filter((r) => r.source_issue_id === issueId || r.target_issue_id === issueId);
  return [...store];
}

export function getRelation(id: string): IssueRelation | null {
  return store.find((r) => r.id === id) || null;
}

export function addRelation(sourceId: string, targetId: string, type: RelationType): IssueRelation | null {
  if (sourceId === targetId) return null;
  const exists = store.find((r) => r.source_issue_id === sourceId && r.target_issue_id === targetId && r.type === type);
  if (exists) return exists;
  const rel: IssueRelation = { id: genId(), source_issue_id: sourceId, target_issue_id: targetId, type, created_at: new Date().toISOString() };
  store.push(rel);
  return rel;
}

export function removeRelation(id: string): boolean {
  const idx = store.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function childIssues(parentId: string): string[] {
  return store
    .filter((r) => r.source_issue_id === parentId && r.type === "parent")
    .map((r) => r.target_issue_id);
}

export function parentIssue(childId: string): string | null {
  const rel = store.find((r) => r.source_issue_id === childId && r.type === "child");
  return rel ? rel.target_issue_id : null;
}

export function duplicates(issueId: string): string[] {
  return store
    .filter((r) => (r.source_issue_id === issueId || r.target_issue_id === issueId) && r.type === "duplicate")
    .map((r) => r.source_issue_id === issueId ? r.target_issue_id : r.source_issue_id);
}
