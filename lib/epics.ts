export type Epic = {
  id: string;
  name: string;
  description: string;
  color: string;
  status: "active" | "completed" | "archived";
  owner: string;
  created_at: string;
};

const store: Epic[] = [
  {
    id: "epic-onboarding",
    name: "User Onboarding",
    description: "All work related to the new user onboarding experience",
    color: "#7cffb2",
    status: "active",
    owner: "Max",
    created_at: "2025-01-10T00:00:00.000Z",
  },
  {
    id: "epic-perf",
    name: "Performance",
    description: "Performance optimization across the platform",
    color: "#c9b7ff",
    status: "active",
    owner: "Alice",
    created_at: "2025-02-01T00:00:00.000Z",
  },
];

const epicIssues: { epic_id: string; issue_id: string }[] = [];

export function listEpics(): Epic[] {
  return [...store];
}

export function getEpic(id: string): Epic | null {
  return store.find((e) => e.id === id) || null;
}

export function createEpic(name: string, description = "", color = "#8a8376", owner = "operator"): Epic {
  const epic: Epic = {
    id: `epic-${crypto.randomUUID().slice(0, 8)}`,
    name: name.trim(),
    description,
    color,
    status: "active",
    owner,
    created_at: new Date().toISOString(),
  };
  store.push(epic);
  return epic;
}

export function updateEpic(id: string, updates: Partial<Pick<Epic, "name" | "description" | "color" | "status" | "owner">>): Epic | null {
  const e = store.find((ep) => ep.id === id);
  if (!e) return null;
  if (updates.name !== undefined) e.name = updates.name.trim();
  if (updates.description !== undefined) e.description = updates.description;
  if (updates.color !== undefined) e.color = updates.color;
  if (updates.status !== undefined) e.status = updates.status;
  if (updates.owner !== undefined) e.owner = updates.owner;
  return e;
}

export function deleteEpic(id: string): boolean {
  const idx = store.findIndex((e) => e.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  const toRemove = epicIssues.filter((ei) => ei.epic_id === id);
  for (const ei of toRemove) {
    const i = epicIssues.indexOf(ei);
    if (i >= 0) epicIssues.splice(i, 1);
  }
  return true;
}

export function addIssueToEpic(epicId: string, issueId: string): boolean {
  if (!store.some((e) => e.id === epicId)) return false;
  if (epicIssues.some((ei) => ei.epic_id === epicId && ei.issue_id === issueId)) return true;
  epicIssues.push({ epic_id: epicId, issue_id: issueId });
  return true;
}

export function removeIssueFromEpic(epicId: string, issueId: string): boolean {
  const idx = epicIssues.findIndex((ei) => ei.epic_id === epicId && ei.issue_id === issueId);
  if (idx < 0) return false;
  epicIssues.splice(idx, 1);
  return true;
}

export function issuesForEpic(epicId: string): string[] {
  return epicIssues.filter((ei) => ei.epic_id === epicId).map((ei) => ei.issue_id);
}

export function epicForIssue(issueId: string): Epic | null {
  const entry = epicIssues.find((ei) => ei.issue_id === issueId);
  if (!entry) return null;
  return store.find((e) => e.id === entry.epic_id) || null;
}
