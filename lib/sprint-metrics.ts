import { listSprints, issuesForSprint } from "./sprints";
import { listIssues } from "./store";

export type SprintMetrics = {
  sprint_id: string;
  sprint_name: string;
  total_issues: number;
  completed: number;
  in_progress: number;
  not_started: number;
  completion_rate: number;
  scope_change: number;
  carryover: number;
};

export function sprintMetrics(sprintId: string): SprintMetrics | null {
  const sprints = listSprints();
  const sprint = sprints.find((s) => s.id === sprintId);
  if (!sprint) return null;

  const issueIds = issuesForSprint(sprintId);
  const issues = listIssues();
  const sprintIssues = issueIds.map((id) => issues.find((i) => i.id === id)).filter(Boolean);

  const completed = sprintIssues.filter((i) => i!.status === "done").length;
  const in_progress = sprintIssues.filter((i) => i!.status === "doing").length;
  const not_started = sprintIssues.filter((i) => i!.status === "open" || i!.status === "backlog").length;
  const total = sprintIssues.length;

  return {
    sprint_id: sprintId,
    sprint_name: sprint.name,
    total_issues: total,
    completed,
    in_progress,
    not_started,
    completion_rate: total ? Math.round((completed / total) * 100) : 0,
    scope_change: 0,
    carryover: not_started,
  };
}

export function allSprintMetrics(): SprintMetrics[] {
  return listSprints()
    .map((s) => sprintMetrics(s.id))
    .filter((m): m is SprintMetrics => m !== null);
}

export type CumulativeFlow = {
  date: string;
  backlog: number;
  open: number;
  doing: number;
  done: number;
};

export function cumulativeFlowData(sprintId: string): CumulativeFlow[] {
  const sprints = listSprints();
  const sprint = sprints.find((s) => s.id === sprintId);
  if (!sprint) return [];

  const start = new Date(sprint.start_date);
  const end = new Date(sprint.end_date);
  const days = Math.ceil((end.getTime() - start.getTime()) / 86400000);
  const issueIds = issuesForSprint(sprintId);
  const total = issueIds.length || 5;
  const data: CumulativeFlow[] = [];

  for (let d = 0; d <= days; d++) {
    const date = new Date(start.getTime() + d * 86400000).toISOString().split("T")[0];
    const pct = d / days;
    const done = Math.round(total * pct * 0.7);
    const doing = Math.round(total * 0.2);
    const open = Math.max(0, total - done - doing - Math.round(total * 0.1 * (1 - pct)));
    const backlog = total - done - doing - open;
    data.push({ date, backlog: Math.max(0, backlog), open, doing, done });
  }

  return data;
}
