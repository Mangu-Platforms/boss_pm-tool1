import { getIssue, updateIssue } from "./store";
import type { IssueStatus, IssuePriority } from "./types";

export type BulkOperation = {
  id: string;
  action: string;
  issue_ids: string[];
  params: Record<string, unknown>;
  results: { id: string; success: boolean; error?: string }[];
  created_at: string;
};

const history: BulkOperation[] = [];
let nextId = 1;
function genId() { return `bulk-${nextId++}`; }

export function bulkUpdateStatus(issueIds: string[], status: IssueStatus): BulkOperation {
  const op: BulkOperation = {
    id: genId(), action: "update_status", issue_ids: issueIds,
    params: { status }, results: [], created_at: new Date().toISOString(),
  };
  for (const id of issueIds) {
    const issue = getIssue(id);
    if (!issue) { op.results.push({ id, success: false, error: "Not found" }); continue; }
    updateIssue(id, { status });
    op.results.push({ id, success: true });
  }
  history.push(op);
  return op;
}

export function bulkUpdatePriority(issueIds: string[], priority: IssuePriority): BulkOperation {
  const op: BulkOperation = {
    id: genId(), action: "update_priority", issue_ids: issueIds,
    params: { priority }, results: [], created_at: new Date().toISOString(),
  };
  for (const id of issueIds) {
    const issue = getIssue(id);
    if (!issue) { op.results.push({ id, success: false, error: "Not found" }); continue; }
    updateIssue(id, { priority });
    op.results.push({ id, success: true });
  }
  history.push(op);
  return op;
}

export function bulkAssign(issueIds: string[], assigneeUser: string): BulkOperation {
  const op: BulkOperation = {
    id: genId(), action: "assign", issue_ids: issueIds,
    params: { assignee_user: assigneeUser }, results: [], created_at: new Date().toISOString(),
  };
  for (const id of issueIds) {
    const issue = getIssue(id);
    if (!issue) { op.results.push({ id, success: false, error: "Not found" }); continue; }
    updateIssue(id, { assignee_user: assigneeUser });
    op.results.push({ id, success: true });
  }
  history.push(op);
  return op;
}

export function bulkHistory(): BulkOperation[] {
  return [...history].reverse();
}

export function getBulkOperation(id: string): BulkOperation | null {
  return history.find((o) => o.id === id) || null;
}
