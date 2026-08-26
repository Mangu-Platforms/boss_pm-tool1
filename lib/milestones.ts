export type Milestone = {
  id: string;
  name: string;
  description: string;
  due_on: string | null;
  status: "active" | "completed" | "cancelled";
  created_at: string;
};

const store: Milestone[] = [
  {
    id: "ms-v1",
    name: "v1.0 Launch",
    description: "Core PM features ready for production",
    due_on: "2025-09-01",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "ms-beta",
    name: "Beta rollout",
    description: "Selected customers onboarded",
    due_on: "2025-07-15",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
  },
];

const milestoneIssues: { milestone_id: string; issue_id: string }[] = [];

export function listMilestones(): Milestone[] {
  return [...store].sort((a, b) => {
    if (a.status === "active" && b.status !== "active") return -1;
    if (a.status !== "active" && b.status === "active") return 1;
    return (a.due_on || "9999").localeCompare(b.due_on || "9999");
  });
}

export function getMilestone(id: string): Milestone | null {
  return store.find((m) => m.id === id) || null;
}

export function createMilestone(name: string, description: string, dueOn: string | null): Milestone {
  const ms: Milestone = {
    id: crypto.randomUUID(),
    name,
    description,
    due_on: dueOn,
    status: "active",
    created_at: new Date().toISOString(),
  };
  store.push(ms);
  return ms;
}

export function updateMilestone(id: string, updates: Partial<Pick<Milestone, "name" | "description" | "due_on" | "status">>): Milestone | null {
  const ms = store.find((m) => m.id === id);
  if (!ms) return null;
  if (updates.name !== undefined) ms.name = updates.name;
  if (updates.description !== undefined) ms.description = updates.description;
  if (updates.due_on !== undefined) ms.due_on = updates.due_on;
  if (updates.status !== undefined) ms.status = updates.status;
  return ms;
}

export function deleteMilestone(id: string): boolean {
  const idx = store.findIndex((m) => m.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  const toRemove = milestoneIssues.filter((mi) => mi.milestone_id === id);
  for (const mi of toRemove) {
    const i = milestoneIssues.indexOf(mi);
    if (i >= 0) milestoneIssues.splice(i, 1);
  }
  return true;
}

export function addIssueToMilestone(milestoneId: string, issueId: string): boolean {
  if (!store.find((m) => m.id === milestoneId)) return false;
  if (milestoneIssues.find((mi) => mi.milestone_id === milestoneId && mi.issue_id === issueId)) return true;
  milestoneIssues.push({ milestone_id: milestoneId, issue_id: issueId });
  return true;
}

export function removeIssueFromMilestone(milestoneId: string, issueId: string): boolean {
  const idx = milestoneIssues.findIndex((mi) => mi.milestone_id === milestoneId && mi.issue_id === issueId);
  if (idx < 0) return false;
  milestoneIssues.splice(idx, 1);
  return true;
}

export function issuesForMilestone(milestoneId: string): string[] {
  return milestoneIssues.filter((mi) => mi.milestone_id === milestoneId).map((mi) => mi.issue_id);
}

export function milestoneForIssue(issueId: string): string | null {
  const mi = milestoneIssues.find((mi) => mi.issue_id === issueId);
  return mi?.milestone_id || null;
}
