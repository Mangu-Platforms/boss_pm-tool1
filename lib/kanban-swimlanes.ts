import { listIssues } from "./store";
import type { Issue } from "./types";

export type SwimlaneCriteria = "assignee" | "priority" | "product" | "status" | "none";

export type SwimlaneGroup = {
  key: string;
  label: string;
  issues: Issue[];
};

export type KanbanColumn = {
  status: string;
  issues: Issue[];
};

export type SwimlanedBoard = {
  criteria: SwimlaneCriteria;
  swimlanes: {
    key: string;
    label: string;
    columns: KanbanColumn[];
  }[];
};

const STATUS_ORDER = ["backlog", "open", "doing", "done", "cancelled"];

function groupBy(issues: Issue[], criteria: SwimlaneCriteria): SwimlaneGroup[] {
  if (criteria === "none") {
    return [{ key: "all", label: "All Issues", issues }];
  }

  const groups: Record<string, Issue[]> = {};

  issues.forEach((issue) => {
    let key: string;
    switch (criteria) {
      case "assignee":
        key = issue.assignee_user || "Unassigned";
        break;
      case "priority":
        key = issue.priority;
        break;
      case "product":
        key = issue.product_id || "No Product";
        break;
      case "status":
        key = issue.status;
        break;
      default:
        key = "all";
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(issue);
  });

  return Object.entries(groups)
    .map(([key, issues]) => ({ key, label: key, issues }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function swimlanedBoard(criteria: SwimlaneCriteria = "none"): SwimlanedBoard {
  const issues = listIssues();
  const lanes = groupBy(issues, criteria);

  return {
    criteria,
    swimlanes: lanes.map((lane) => ({
      key: lane.key,
      label: lane.label,
      columns: STATUS_ORDER.map((status) => ({
        status,
        issues: lane.issues.filter((i) => i.status === status),
      })),
    })),
  };
}

export function boardStats(): { total: number; by_status: Record<string, number>; by_assignee: Record<string, number> } {
  const issues = listIssues();
  const by_status: Record<string, number> = {};
  const by_assignee: Record<string, number> = {};
  issues.forEach((i) => {
    by_status[i.status] = (by_status[i.status] || 0) + 1;
    const a = i.assignee_user || "Unassigned";
    by_assignee[a] = (by_assignee[a] || 0) + 1;
  });
  return { total: issues.length, by_status, by_assignee };
}
