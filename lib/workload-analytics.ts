import { listIssues } from "./store";

export type MemberWorkload = {
  member: string;
  total: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  overdue: number;
};

export function memberWorkloads(): MemberWorkload[] {
  const issues = listIssues();
  const now = new Date().toISOString();
  const byMember: Record<string, MemberWorkload> = {};

  for (const i of issues) {
    const member = i.assignee_user || "(unassigned)";
    if (!byMember[member]) {
      byMember[member] = { member, total: 0, by_status: {}, by_priority: {}, overdue: 0 };
    }
    const w = byMember[member];
    w.total++;
    w.by_status[i.status] = (w.by_status[i.status] || 0) + 1;
    w.by_priority[i.priority] = (w.by_priority[i.priority] || 0) + 1;
    if (i.due_on && i.due_on < now && i.status !== "done" && i.status !== "cancelled") w.overdue++;
  }

  return Object.values(byMember).sort((a, b) => b.total - a.total);
}

export type PriorityBreakdown = {
  priority: string;
  count: number;
  done: number;
  in_progress: number;
  pct_done: number;
};

export function priorityBreakdown(): PriorityBreakdown[] {
  const issues = listIssues();
  const byPriority: Record<string, { count: number; done: number; in_progress: number }> = {};

  for (const i of issues) {
    if (!byPriority[i.priority]) byPriority[i.priority] = { count: 0, done: 0, in_progress: 0 };
    byPriority[i.priority].count++;
    if (i.status === "done") byPriority[i.priority].done++;
    if (i.status === "doing") byPriority[i.priority].in_progress++;
  }

  return Object.entries(byPriority).map(([priority, data]) => ({
    priority,
    ...data,
    pct_done: data.count ? Math.round((data.done / data.count) * 100) : 0,
  }));
}

export type AgingIssue = {
  id: string;
  title: string;
  status: string;
  age_days: number;
  priority: string;
};

export function agingIssues(minDays = 7): AgingIssue[] {
  const issues = listIssues();
  const now = Date.now();
  return issues
    .filter((i) => i.status !== "done" && i.status !== "cancelled")
    .map((i) => {
      const age_days = Math.floor((now - new Date(i.created_at).getTime()) / 86400000);
      return { id: i.id, title: i.title, status: i.status, age_days, priority: i.priority };
    })
    .filter((i) => i.age_days >= minDays)
    .sort((a, b) => b.age_days - a.age_days);
}
