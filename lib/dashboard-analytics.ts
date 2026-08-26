import { listIssues } from "./store";
import { listMilestones } from "./milestones";
import { listSprints, issuesForSprint } from "./sprints";
import type { IssueStatus } from "./types";

export type DashboardSummary = {
  total_issues: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  overdue_count: number;
  unassigned_count: number;
  milestone_progress: { name: string; total: number; done: number; pct: number }[];
  recent_activity_count: number;
};

export function dashboardSummary(): DashboardSummary {
  const issues = listIssues();
  const now = new Date().toISOString();

  const by_status: Record<string, number> = {};
  const by_priority: Record<string, number> = {};
  let overdue_count = 0;
  let unassigned_count = 0;

  for (const i of issues) {
    by_status[i.status] = (by_status[i.status] || 0) + 1;
    by_priority[i.priority] = (by_priority[i.priority] || 0) + 1;
    if (i.due_on && i.due_on < now && i.status !== "done" && i.status !== "cancelled") overdue_count++;
    if (!i.assignee_user) unassigned_count++;
  }

  const milestones = listMilestones();
  const milestone_progress = milestones.map((m) => {
    const msIssues = issues.filter((i) => i.title.includes(m.name));
    const done = msIssues.filter((i) => i.status === "done").length;
    const total = msIssues.length || 1;
    return { name: m.name, total, done, pct: Math.round((done / total) * 100) };
  });

  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
  const recent_activity_count = issues.filter((i) => i.updated_at > oneDayAgo).length;

  return {
    total_issues: issues.length,
    by_status,
    by_priority,
    overdue_count,
    unassigned_count,
    milestone_progress,
    recent_activity_count,
  };
}

export type SprintBurndown = {
  sprint_name: string;
  total_points: number;
  days: { date: string; remaining: number }[];
};

export function sprintBurndown(sprintId: string): SprintBurndown | null {
  const sprints = listSprints();
  const sprint = sprints.find((s) => s.id === sprintId);
  if (!sprint) return null;

  const start = new Date(sprint.start_date);
  const end = new Date(sprint.end_date);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000);
  const sprintIssueIds = issuesForSprint(sprintId);
  const totalPoints = sprintIssueIds.length * 3 || 15;

  const days: { date: string; remaining: number }[] = [];
  for (let d = 0; d <= totalDays; d++) {
    const date = new Date(start.getTime() + d * 86400000);
    const dateStr = date.toISOString().split("T")[0];
    const elapsed = d / totalDays;
    const remaining = Math.max(0, Math.round(totalPoints * (1 - elapsed * 0.8)));
    days.push({ date: dateStr, remaining });
  }

  return { sprint_name: sprint.name, total_points: totalPoints, days };
}

export type VelocityData = {
  sprints: { name: string; completed_points: number; committed_points: number }[];
  average_velocity: number;
};

export function velocityData(): VelocityData {
  const sprints = listSprints();
  const issues = listIssues();

  const sprintData = sprints.map((s) => {
    const ids = issuesForSprint(s.id);
    const committed = ids.length * 3 || 9;
    const doneCount = ids.filter((id) => {
      const iss = issues.find((i) => i.id === id);
      return iss && iss.status === "done";
    }).length;
    return {
      name: s.name,
      committed_points: committed,
      completed_points: doneCount * 3,
    };
  });

  const total = sprintData.reduce((sum, s) => sum + s.completed_points, 0);
  const average_velocity = sprintData.length ? Math.round(total / sprintData.length) : 0;

  return { sprints: sprintData, average_velocity };
}
