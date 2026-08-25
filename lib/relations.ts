type RelationType = "blocks" | "blocked-by" | "relates-to" | "duplicates";

export type IssueRelation = {
  id: string;
  from_issue_id: string;
  to_issue_id: string;
  relation_type: RelationType;
  created_at: string;
};

const relations: IssueRelation[] = [];

export function addRelation(fromId: string, toId: string, type: RelationType): IssueRelation {
  if (fromId === toId) throw new Error("cannot relate issue to itself");
  const existing = relations.find(
    (r) => r.from_issue_id === fromId && r.to_issue_id === toId && r.relation_type === type
  );
  if (existing) return existing;

  const rel: IssueRelation = {
    id: crypto.randomUUID(),
    from_issue_id: fromId,
    to_issue_id: toId,
    relation_type: type,
    created_at: new Date().toISOString(),
  };
  relations.push(rel);
  return rel;
}

export function listRelations(issueId: string): IssueRelation[] {
  return relations.filter(
    (r) => r.from_issue_id === issueId || r.to_issue_id === issueId
  );
}

export function removeRelation(id: string): boolean {
  const idx = relations.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  relations.splice(idx, 1);
  return true;
}
