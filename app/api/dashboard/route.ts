import { NextResponse } from "next/server";
import { dbListIssues } from "@/lib/db";
import { listSprints, issuesForSprint } from "@/lib/sprints";
import { listMilestones, issuesForMilestone } from "@/lib/milestones";
import { unreadCount } from "@/lib/notifications";
import { listAutomations } from "@/lib/automations";

export async function GET() {
  const allIssues = await dbListIssues();
  const sprints = listSprints();
  const milestones = listMilestones();
  const unread = unreadCount();
  const automations = listAutomations();

  const statusCounts: Record<string, number> = {};
  const priorityCounts: Record<string, number> = {};
  let agentAssigned = 0;
  let overdueCount = 0;
  const today = new Date().toISOString().split("T")[0];

  for (const issue of allIssues) {
    statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
    priorityCounts[issue.priority] = (priorityCounts[issue.priority] || 0) + 1;
    if (issue.assignee_kind === "agent") agentAssigned++;
    if (issue.due_on && issue.due_on < today && issue.status !== "done" && issue.status !== "cancelled") {
      overdueCount++;
    }
  }

  const activeSprint = sprints.find((s) => s.status === "active");
  let sprintProgress = null;
  if (activeSprint) {
    const sprintIssueIds = issuesForSprint(activeSprint.id);
    const sprintIssues = allIssues.filter((i) => sprintIssueIds.includes(i.id));
    const done = sprintIssues.filter((i) => i.status === "done" || i.status === "cancelled").length;
    sprintProgress = {
      name: activeSprint.name,
      total: sprintIssues.length,
      done,
      percent: sprintIssues.length > 0 ? Math.round((done / sprintIssues.length) * 100) : 0,
      end_date: activeSprint.end_date,
    };
  }

  const activeMilestones = milestones.filter((m) => m.status === "active").map((ms) => {
    const ids = issuesForMilestone(ms.id);
    const issues = allIssues.filter((i) => ids.includes(i.id));
    const done = issues.filter((i) => i.status === "done" || i.status === "cancelled").length;
    return {
      id: ms.id,
      name: ms.name,
      progress: issues.length > 0 ? Math.round((done / issues.length) * 100) : 0,
      due_on: ms.due_on,
    };
  });

  return NextResponse.json({
    total_issues: allIssues.length,
    status_counts: statusCounts,
    priority_counts: priorityCounts,
    agent_assigned: agentAssigned,
    overdue: overdueCount,
    unread_notifications: unread,
    active_automations: automations.filter((a) => a.enabled).length,
    sprint: sprintProgress,
    milestones: activeMilestones,
  });
}
