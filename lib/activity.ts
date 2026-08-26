import type { Issue } from "./types";

export type ActivityEvent = {
  id: string;
  issue_id: string;
  product_id: string;
  action: "created" | "status_changed" | "priority_changed" | "assigned" | "updated" | "deleted";
  actor: string;
  detail: string;
  created_at: string;
};

const store: ActivityEvent[] = [];

export function logActivity(
  issue: Pick<Issue, "id" | "product_id">,
  action: ActivityEvent["action"],
  detail: string,
  actor = "system"
) {
  const event: ActivityEvent = {
    id: crypto.randomUUID(),
    issue_id: issue.id,
    product_id: issue.product_id,
    action,
    actor,
    detail,
    created_at: new Date().toISOString(),
  };
  store.unshift(event);
  if (store.length > 500) store.length = 500;
  return event;
}

export function getActivity(opts?: {
  issue_id?: string;
  product_id?: string;
  limit?: number;
}): ActivityEvent[] {
  let result = store;
  if (opts?.issue_id) result = result.filter((e) => e.issue_id === opts.issue_id);
  if (opts?.product_id) result = result.filter((e) => e.product_id === opts.product_id);
  return result.slice(0, opts?.limit ?? 50);
}
