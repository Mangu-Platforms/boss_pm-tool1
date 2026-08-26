export type Sprint = {
  id: string;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  status: "planning" | "active" | "completed";
  created_at: string;
};

const store: Sprint[] = [
  {
    id: "sprint-1",
    name: "Sprint 1",
    goal: "Core issue management",
    start_date: "2025-08-18",
    end_date: "2025-09-01",
    status: "active",
    created_at: "2025-08-15T00:00:00Z",
  },
  {
    id: "sprint-2",
    name: "Sprint 2",
    goal: "Analytics and reporting",
    start_date: "2025-09-01",
    end_date: "2025-09-15",
    status: "planning",
    created_at: "2025-08-15T00:00:00Z",
  },
];

const sprintIssues: { sprint_id: string; issue_id: string }[] = [];

export function listSprints(): Sprint[] {
  return [...store].sort((a, b) => {
    const statusOrder = { active: 0, planning: 1, completed: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return a.start_date.localeCompare(b.start_date);
  });
}

export function getSprint(id: string): Sprint | null {
  return store.find((s) => s.id === id) || null;
}

export function createSprint(name: string, goal: string, startDate: string, endDate: string): Sprint {
  const sprint: Sprint = {
    id: crypto.randomUUID(),
    name,
    goal,
    start_date: startDate,
    end_date: endDate,
    status: "planning",
    created_at: new Date().toISOString(),
  };
  store.push(sprint);
  return sprint;
}

export function updateSprint(id: string, updates: Partial<Pick<Sprint, "name" | "goal" | "start_date" | "end_date" | "status">>): Sprint | null {
  const sprint = store.find((s) => s.id === id);
  if (!sprint) return null;
  if (updates.name !== undefined) sprint.name = updates.name;
  if (updates.goal !== undefined) sprint.goal = updates.goal;
  if (updates.start_date !== undefined) sprint.start_date = updates.start_date;
  if (updates.end_date !== undefined) sprint.end_date = updates.end_date;
  if (updates.status !== undefined) sprint.status = updates.status;
  return sprint;
}

export function deleteSprint(id: string): boolean {
  const idx = store.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  const toRemove = sprintIssues.filter((si) => si.sprint_id === id);
  for (const si of toRemove) {
    const i = sprintIssues.indexOf(si);
    if (i >= 0) sprintIssues.splice(i, 1);
  }
  return true;
}

export function addIssueToSprint(sprintId: string, issueId: string): boolean {
  if (!store.find((s) => s.id === sprintId)) return false;
  // Remove from any other sprint first
  const existing = sprintIssues.findIndex((si) => si.issue_id === issueId);
  if (existing >= 0) sprintIssues.splice(existing, 1);
  sprintIssues.push({ sprint_id: sprintId, issue_id: issueId });
  return true;
}

export function removeIssueFromSprint(sprintId: string, issueId: string): boolean {
  const idx = sprintIssues.findIndex((si) => si.sprint_id === sprintId && si.issue_id === issueId);
  if (idx < 0) return false;
  sprintIssues.splice(idx, 1);
  return true;
}

export function issuesForSprint(sprintId: string): string[] {
  return sprintIssues.filter((si) => si.sprint_id === sprintId).map((si) => si.issue_id);
}

export function sprintForIssue(issueId: string): string | null {
  const si = sprintIssues.find((si) => si.issue_id === issueId);
  return si?.sprint_id || null;
}

export function sprintVelocity(sprintId: string, doneIssueIds: string[]): { total: number; done: number; percent: number } {
  const ids = issuesForSprint(sprintId);
  const done = ids.filter((id) => doneIssueIds.includes(id)).length;
  return {
    total: ids.length,
    done,
    percent: ids.length > 0 ? Math.round((done / ids.length) * 100) : 0,
  };
}
