import { getIssue, createIssue } from "./store";
import type { Issue } from "./types";

export type CloneOptions = {
  include_assignee?: boolean;
  include_priority?: boolean;
  prefix?: string;
  target_product_id?: string;
};

export type CloneResult = {
  original_id: string;
  cloned_id: string;
  title: string;
};

export function cloneIssue(issueId: string, options: CloneOptions = {}): CloneResult | null {
  const original = getIssue(issueId);
  if (!original) return null;

  const prefix = options.prefix || "[Clone]";
  const keepAssignee = options.include_assignee !== false;
  const cloned = createIssue({
    product_id: options.target_product_id || original.product_id,
    title: `${prefix} ${original.title}`,
    body: original.body,
    priority: options.include_priority !== false ? original.priority : "medium",
    assignee_kind: keepAssignee ? original.assignee_kind : "user",
    assignee_user: keepAssignee ? original.assignee_user : "max",
    agent_name: keepAssignee ? original.agent_name : null,
    cost_cap_cents: keepAssignee ? original.cost_cap_cents : null,
    due_on: original.due_on,
  });

  return { original_id: issueId, cloned_id: cloned.id, title: cloned.title };
}

export function bulkClone(issueIds: string[], options: CloneOptions = {}): CloneResult[] {
  return issueIds
    .map((id) => cloneIssue(id, options))
    .filter((r): r is CloneResult => r !== null);
}
