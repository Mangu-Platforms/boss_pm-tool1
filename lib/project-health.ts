import { listIssues } from "./store";
import { listMilestones } from "./milestones";
import { listSprints } from "./sprints";

export type HealthIndicator = "excellent" | "good" | "at_risk" | "critical";

export type ProjectHealthScore = {
  overall: number;
  indicator: HealthIndicator;
  breakdown: {
    velocity: { score: number; label: string };
    backlog_health: { score: number; label: string };
    overdue: { score: number; label: string };
    milestone_progress: { score: number; label: string };
    team_load: { score: number; label: string };
  };
  recommendations: string[];
};

function indicator(score: number): HealthIndicator {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "at_risk";
  return "critical";
}

export function projectHealth(): ProjectHealthScore {
  const issues = listIssues();
  const milestones = listMilestones();
  const now = new Date().toISOString();
  const recommendations: string[] = [];

  const totalIssues = issues.length || 1;
  const doneIssues = issues.filter((i) => i.status === "done").length;
  const overdueIssues = issues.filter((i) => i.due_on && i.due_on < now && i.status !== "done" && i.status !== "cancelled");
  const backlogIssues = issues.filter((i) => i.status === "backlog");
  const unassigned = issues.filter((i) => !i.assignee_user && i.status !== "done" && i.status !== "cancelled");

  const velocityScore = Math.min(100, Math.round((doneIssues / totalIssues) * 150));
  const overdueScore = Math.max(0, 100 - overdueIssues.length * 15);
  const backlogScore = backlogIssues.length > totalIssues * 0.5 ? 40 : backlogIssues.length > totalIssues * 0.3 ? 60 : 85;

  const completedMilestones = milestones.filter((m) => m.status === "completed").length;
  const milestoneScore = milestones.length ? Math.round((completedMilestones / milestones.length) * 100) : 70;

  const teamLoadScore = unassigned.length > 5 ? 50 : unassigned.length > 2 ? 70 : 90;

  if (overdueIssues.length > 3) recommendations.push("Address overdue issues — " + overdueIssues.length + " past due");
  if (backlogIssues.length > totalIssues * 0.4) recommendations.push("Backlog is growing — prioritize or close stale items");
  if (unassigned.length > 3) recommendations.push("Assign open issues — " + unassigned.length + " unassigned");
  if (velocityScore < 50) recommendations.push("Velocity is low — review sprint capacity");

  const overall = Math.round((velocityScore + overdueScore + backlogScore + milestoneScore + teamLoadScore) / 5);

  return {
    overall,
    indicator: indicator(overall),
    breakdown: {
      velocity: { score: velocityScore, label: velocityScore >= 70 ? "Healthy" : "Needs attention" },
      backlog_health: { score: backlogScore, label: backlogScore >= 70 ? "Manageable" : "Growing" },
      overdue: { score: overdueScore, label: overdueIssues.length === 0 ? "No overdue" : `${overdueIssues.length} overdue` },
      milestone_progress: { score: milestoneScore, label: `${completedMilestones}/${milestones.length} completed` },
      team_load: { score: teamLoadScore, label: unassigned.length === 0 ? "Balanced" : `${unassigned.length} unassigned` },
    },
    recommendations,
  };
}
