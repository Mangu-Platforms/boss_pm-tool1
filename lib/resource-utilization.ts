import { listIssues } from "./store";

export type UtilizationPeriod = "daily" | "weekly" | "monthly";

export type ResourceEntry = {
  id: string;
  member: string;
  period: UtilizationPeriod;
  period_start: string;
  available_hours: number;
  assigned_hours: number;
  logged_hours: number;
  utilization_pct: number;
};

export type UtilizationSummary = {
  total_members: number;
  avg_utilization: number;
  over_utilized: number;
  under_utilized: number;
  balanced: number;
};

const entries: ResourceEntry[] = [
  { id: "ru-1", member: "max", period: "weekly", period_start: "2025-08-18", available_hours: 40, assigned_hours: 36, logged_hours: 34, utilization_pct: 85 },
  { id: "ru-2", member: "sami", period: "weekly", period_start: "2025-08-18", available_hours: 40, assigned_hours: 42, logged_hours: 38, utilization_pct: 95 },
  { id: "ru-3", member: "priya", period: "weekly", period_start: "2025-08-18", available_hours: 32, assigned_hours: 28, logged_hours: 26, utilization_pct: 81 },
  { id: "ru-4", member: "carlos", period: "weekly", period_start: "2025-08-18", available_hours: 40, assigned_hours: 20, logged_hours: 18, utilization_pct: 45 },
  { id: "ru-5", member: "max", period: "weekly", period_start: "2025-08-11", available_hours: 40, assigned_hours: 38, logged_hours: 37, utilization_pct: 93 },
  { id: "ru-6", member: "sami", period: "weekly", period_start: "2025-08-11", available_hours: 40, assigned_hours: 35, logged_hours: 33, utilization_pct: 83 },
];

let nextId = 7;

export function listUtilization(member?: string, period?: UtilizationPeriod): ResourceEntry[] {
  let result = [...entries];
  if (member) result = result.filter((e) => e.member === member);
  if (period) result = result.filter((e) => e.period === period);
  return result.sort((a, b) => b.period_start.localeCompare(a.period_start));
}

export function getUtilization(id: string): ResourceEntry | null {
  return entries.find((e) => e.id === id) || null;
}

export function recordUtilization(member: string, period: UtilizationPeriod, periodStart: string, availableHours: number, assignedHours: number, loggedHours: number): ResourceEntry {
  const pct = availableHours > 0 ? Math.round((loggedHours / availableHours) * 100) : 0;
  const entry: ResourceEntry = {
    id: `ru-${nextId++}`,
    member,
    period,
    period_start: periodStart,
    available_hours: availableHours,
    assigned_hours: assignedHours,
    logged_hours: loggedHours,
    utilization_pct: pct,
  };
  entries.push(entry);
  return entry;
}

export function utilizationSummary(periodStart?: string): UtilizationSummary {
  const filtered = periodStart ? entries.filter((e) => e.period_start === periodStart) : entries;
  const members = [...new Set(filtered.map((e) => e.member))];
  const avgByMember = members.map((m) => {
    const memberEntries = filtered.filter((e) => e.member === m);
    return memberEntries.reduce((sum, e) => sum + e.utilization_pct, 0) / memberEntries.length;
  });
  const avg = avgByMember.length > 0 ? Math.round(avgByMember.reduce((a, b) => a + b, 0) / avgByMember.length) : 0;
  return {
    total_members: members.length,
    avg_utilization: avg,
    over_utilized: avgByMember.filter((p) => p > 90).length,
    under_utilized: avgByMember.filter((p) => p < 60).length,
    balanced: avgByMember.filter((p) => p >= 60 && p <= 90).length,
  };
}

export function memberWorkload(member: string): { active_issues: number; total_issues: number } {
  const issues = listIssues();
  const memberIssues = issues.filter((i) => i.assignee_user === member);
  return {
    active_issues: memberIssues.filter((i) => i.status === "doing" || i.status === "open").length,
    total_issues: memberIssues.length,
  };
}
