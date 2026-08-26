export type RecurrencePattern = "daily" | "weekly" | "biweekly" | "monthly" | "quarterly";

export type RecurringTask = {
  id: string;
  title: string;
  body: string;
  priority: string;
  assignee: string;
  pattern: RecurrencePattern;
  next_due: string;
  last_created_at: string | null;
  active: boolean;
  created_at: string;
};

let nextId = 4;
function genId() { return `rt-${nextId++}`; }

const store: RecurringTask[] = [
  { id: "rt-1", title: "Weekly standup prep", body: "Prepare standup notes for the team", priority: "medium", assignee: "max", pattern: "weekly", next_due: "2025-09-01", last_created_at: null, active: true, created_at: "2025-02-01T10:00:00Z" },
  { id: "rt-2", title: "Monthly metrics review", body: "Review KPIs and project metrics", priority: "high", assignee: "alice", pattern: "monthly", next_due: "2025-10-01", last_created_at: null, active: true, created_at: "2025-02-01T10:00:00Z" },
  { id: "rt-3", title: "Quarterly retrospective", body: "Conduct team retrospective", priority: "medium", assignee: "max", pattern: "quarterly", next_due: "2025-10-01", last_created_at: null, active: true, created_at: "2025-02-01T10:00:00Z" },
];

export function listRecurringTasks(active?: boolean): RecurringTask[] {
  if (active !== undefined) return store.filter((t) => t.active === active);
  return [...store];
}

export function getRecurringTask(id: string): RecurringTask | null {
  return store.find((t) => t.id === id) || null;
}

export function createRecurringTask(title: string, body: string, priority: string, assignee: string, pattern: RecurrencePattern, nextDue: string): RecurringTask {
  const t: RecurringTask = { id: genId(), title, body, priority, assignee, pattern, next_due: nextDue, last_created_at: null, active: true, created_at: new Date().toISOString() };
  store.push(t);
  return t;
}

export function updateRecurringTask(id: string, updates: Partial<Pick<RecurringTask, "title" | "body" | "priority" | "assignee" | "pattern" | "next_due" | "active">>): RecurringTask | null {
  const t = store.find((tk) => tk.id === id);
  if (!t) return null;
  if (updates.title !== undefined) t.title = updates.title;
  if (updates.body !== undefined) t.body = updates.body;
  if (updates.priority !== undefined) t.priority = updates.priority;
  if (updates.assignee !== undefined) t.assignee = updates.assignee;
  if (updates.pattern !== undefined) t.pattern = updates.pattern;
  if (updates.next_due !== undefined) t.next_due = updates.next_due;
  if (updates.active !== undefined) t.active = updates.active;
  return t;
}

function advanceDate(date: string, pattern: RecurrencePattern): string {
  const d = new Date(date);
  switch (pattern) {
    case "daily": d.setDate(d.getDate() + 1); break;
    case "weekly": d.setDate(d.getDate() + 7); break;
    case "biweekly": d.setDate(d.getDate() + 14); break;
    case "monthly": d.setMonth(d.getMonth() + 1); break;
    case "quarterly": d.setMonth(d.getMonth() + 3); break;
  }
  return d.toISOString().split("T")[0];
}

export function triggerRecurringTask(id: string): { issueTitle: string; nextDue: string } | null {
  const t = store.find((tk) => tk.id === id);
  if (!t || !t.active) return null;
  const issueTitle = t.title;
  t.last_created_at = new Date().toISOString();
  t.next_due = advanceDate(t.next_due, t.pattern);
  return { issueTitle, nextDue: t.next_due };
}

export function deleteRecurringTask(id: string): boolean {
  const idx = store.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function dueRecurringTasks(): RecurringTask[] {
  const today = new Date().toISOString().split("T")[0];
  return store.filter((t) => t.active && t.next_due <= today);
}
