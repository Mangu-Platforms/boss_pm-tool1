export type HistoryEntry = {
  id: string;
  issue_id: string;
  field: string;
  old_value: string;
  new_value: string;
  actor: string;
  changed_at: string;
};

const store: HistoryEntry[] = [];

export function recordChange(
  issueId: string,
  field: string,
  oldValue: string,
  newValue: string,
  actor = "operator"
): HistoryEntry {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    issue_id: issueId,
    field,
    old_value: oldValue,
    new_value: newValue,
    actor,
    changed_at: new Date().toISOString(),
  };
  store.push(entry);
  return entry;
}

export function issueHistory(issueId: string): HistoryEntry[] {
  return store
    .filter((e) => e.issue_id === issueId)
    .sort((a, b) => b.changed_at.localeCompare(a.changed_at));
}

export function allHistory(): HistoryEntry[] {
  return [...store].sort((a, b) => b.changed_at.localeCompare(a.changed_at));
}
