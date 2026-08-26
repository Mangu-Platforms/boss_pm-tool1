import { listIssues } from "./store";
import { allTimeEntries } from "./timelog";
import { listSprints, issuesForSprint } from "./sprints";

export type ReportType = "velocity" | "throughput" | "time_spent" | "status_distribution" | "priority_breakdown" | "team_load";

export type ReportData = {
  type: ReportType;
  title: string;
  generated_at: string;
  data: Record<string, unknown>;
};

export function generateReport(type: ReportType): ReportData {
  switch (type) {
    case "velocity":
      return velocityReport();
    case "throughput":
      return throughputReport();
    case "time_spent":
      return timeSpentReport();
    case "status_distribution":
      return statusDistReport();
    case "priority_breakdown":
      return priorityReport();
    case "team_load":
      return teamLoadReport();
    default:
      throw new Error(`Unknown report type: ${type}`);
  }
}

function velocityReport(): ReportData {
  const sprints = listSprints();
  const issues = listIssues();

  const sprintData = sprints.map((s) => {
    const ids = issuesForSprint(s.id);
    const sprintIssues = issues.filter((i) => ids.includes(i.id));
    const done = sprintIssues.filter((i) => i.status === "done").length;
    return {
      sprint: s.name,
      status: s.status,
      total: sprintIssues.length,
      done,
      velocity: sprintIssues.length > 0 ? Math.round((done / sprintIssues.length) * 100) : 0,
    };
  });

  return {
    type: "velocity",
    title: "Sprint Velocity",
    generated_at: new Date().toISOString(),
    data: { sprints: sprintData },
  };
}

function throughputReport(): ReportData {
  const issues = listIssues();
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const recent = issues.filter((i) => i.created_at >= last30Days);
  const completed = recent.filter((i) => i.status === "done");

  const byWeek: Record<string, { created: number; completed: number }> = {};
  for (const i of recent) {
    const week = getWeek(i.created_at);
    if (!byWeek[week]) byWeek[week] = { created: 0, completed: 0 };
    byWeek[week].created++;
  }
  for (const i of completed) {
    const week = getWeek(i.updated_at);
    if (!byWeek[week]) byWeek[week] = { created: 0, completed: 0 };
    byWeek[week].completed++;
  }

  return {
    type: "throughput",
    title: "Throughput (30 days)",
    generated_at: new Date().toISOString(),
    data: {
      total_created: recent.length,
      total_completed: completed.length,
      by_week: byWeek,
    },
  };
}

function timeSpentReport(): ReportData {
  const entries = allTimeEntries();
  const totalMinutes = entries.reduce((s, e) => s + e.minutes, 0);

  const byAuthor: Record<string, number> = {};
  for (const e of entries) {
    byAuthor[e.author] = (byAuthor[e.author] || 0) + e.minutes;
  }

  const byIssue: Record<string, number> = {};
  for (const e of entries) {
    byIssue[e.issue_id] = (byIssue[e.issue_id] || 0) + e.minutes;
  }

  const topIssues = Object.entries(byIssue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, mins]) => ({ issue_id: id, minutes: mins }));

  return {
    type: "time_spent",
    title: "Time Tracking Summary",
    generated_at: new Date().toISOString(),
    data: {
      total_minutes: totalMinutes,
      total_hours: Math.round(totalMinutes / 60 * 10) / 10,
      by_author: byAuthor,
      top_issues: topIssues,
      entry_count: entries.length,
    },
  };
}

function statusDistReport(): ReportData {
  const issues = listIssues();
  const dist: Record<string, number> = {};
  for (const i of issues) {
    dist[i.status] = (dist[i.status] || 0) + 1;
  }

  return {
    type: "status_distribution",
    title: "Status Distribution",
    generated_at: new Date().toISOString(),
    data: {
      total: issues.length,
      distribution: dist,
      percentages: Object.fromEntries(
        Object.entries(dist).map(([k, v]) => [k, Math.round((v / issues.length) * 100)])
      ),
    },
  };
}

function priorityReport(): ReportData {
  const issues = listIssues();
  const dist: Record<string, number> = {};
  for (const i of issues) {
    dist[i.priority] = (dist[i.priority] || 0) + 1;
  }

  return {
    type: "priority_breakdown",
    title: "Priority Breakdown",
    generated_at: new Date().toISOString(),
    data: {
      total: issues.length,
      distribution: dist,
    },
  };
}

function teamLoadReport(): ReportData {
  const issues = listIssues();
  const active = issues.filter((i) => i.status !== "done" && i.status !== "cancelled");

  const byAssignee: Record<string, { total: number; doing: number }> = {};
  for (const i of active) {
    const name = i.assignee_kind === "agent" ? (i.agent_name || "agent") : (i.assignee_user || "unassigned");
    if (!byAssignee[name]) byAssignee[name] = { total: 0, doing: 0 };
    byAssignee[name].total++;
    if (i.status === "doing") byAssignee[name].doing++;
  }

  return {
    type: "team_load",
    title: "Team Load",
    generated_at: new Date().toISOString(),
    data: {
      active_issues: active.length,
      by_assignee: byAssignee,
    },
  };
}

function getWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().slice(0, 10);
}

export function listReportTypes(): { type: ReportType; title: string; description: string }[] {
  return [
    { type: "velocity", title: "Sprint Velocity", description: "Track completion rate across sprints" },
    { type: "throughput", title: "Throughput", description: "Issues created vs completed over 30 days" },
    { type: "time_spent", title: "Time Tracking", description: "Hours logged by team member and issue" },
    { type: "status_distribution", title: "Status Distribution", description: "Current issue status breakdown" },
    { type: "priority_breakdown", title: "Priority Breakdown", description: "Issue count by priority level" },
    { type: "team_load", title: "Team Load", description: "Active issues per team member" },
  ];
}
