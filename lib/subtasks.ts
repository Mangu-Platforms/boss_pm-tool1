export type Subtask = {
  id: string;
  issue_id: string;
  title: string;
  done: boolean;
  position: number;
  created_at: string;
};

const store: Subtask[] = [];

export function addSubtask(issueId: string, title: string): Subtask {
  const position = store.filter((s) => s.issue_id === issueId).length;
  const subtask: Subtask = {
    id: crypto.randomUUID(),
    issue_id: issueId,
    title,
    done: false,
    position,
    created_at: new Date().toISOString(),
  };
  store.push(subtask);
  return subtask;
}

export function listSubtasks(issueId: string): Subtask[] {
  return store
    .filter((s) => s.issue_id === issueId)
    .sort((a, b) => a.position - b.position);
}

export function toggleSubtask(id: string): Subtask | null {
  const s = store.find((s) => s.id === id);
  if (!s) return null;
  s.done = !s.done;
  return s;
}

export function removeSubtask(id: string): boolean {
  const idx = store.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function subtaskProgress(issueId: string): { total: number; done: number } {
  const all = store.filter((s) => s.issue_id === issueId);
  return { total: all.length, done: all.filter((s) => s.done).length };
}
