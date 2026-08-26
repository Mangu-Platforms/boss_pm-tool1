import { listSprints, issuesForSprint } from "./sprints";
import { listIssues, getIssue } from "./store";

export type PlanningIssue = {
  id: string;
  title: string;
  priority: string;
  assignee_user: string | null;
  story_points: number;
  status: string;
};

export type SprintPlan = {
  sprint_id: string;
  sprint_name: string;
  capacity: number;
  committed_points: number;
  issues: PlanningIssue[];
  remaining_capacity: number;
};

export function sprintPlan(sprintId: string, capacity: number = 40): SprintPlan | null {
  const sprint = listSprints().find((s) => s.id === sprintId);
  if (!sprint) return null;
  const issueIds = issuesForSprint(sprintId);
  const issues: PlanningIssue[] = issueIds.map((id) => {
    const issue = getIssue(id);
    return {
      id,
      title: issue?.title || id,
      priority: issue?.priority || "medium",
      assignee_user: issue?.assignee_user || null,
      story_points: (issue as any)?.story_points || 0,
      status: issue?.status || "backlog",
    };
  });
  const committed = issues.reduce((sum, i) => sum + i.story_points, 0);
  return {
    sprint_id: sprintId,
    sprint_name: sprint.name,
    capacity,
    committed_points: committed,
    issues,
    remaining_capacity: Math.max(0, capacity - committed),
  };
}

export function backlogIssues(): PlanningIssue[] {
  return listIssues()
    .filter((i) => i.status === "backlog")
    .map((i) => ({
      id: i.id,
      title: i.title,
      priority: i.priority,
      assignee_user: i.assignee_user,
      story_points: (i as any).story_points || 0,
      status: i.status,
    }));
}

export function planningStats(): { total_backlog: number; total_sprints: number; active_sprints: number } {
  const sprints = listSprints();
  const backlog = listIssues().filter((i) => i.status === "backlog").length;
  return {
    total_backlog: backlog,
    total_sprints: sprints.length,
    active_sprints: sprints.filter((s) => s.status === "active").length,
  };
}
