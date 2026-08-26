export type HistoryEventType = "created" | "status_changed" | "priority_changed" | "assigned" | "commented" | "label_added" | "label_removed" | "due_date_changed" | "edited";

export type HistoryEvent = {
  id: string;
  issue_id: string;
  type: HistoryEventType;
  actor: string;
  old_value: string | null;
  new_value: string | null;
  timestamp: string;
};

let nextId = 6;
function genId() { return `hist-${nextId++}`; }

const store: HistoryEvent[] = [
  { id: "hist-1", issue_id: "ISS-1", type: "created", actor: "max", old_value: null, new_value: null, timestamp: "2025-03-01T10:00:00Z" },
  { id: "hist-2", issue_id: "ISS-1", type: "status_changed", actor: "max", old_value: "open", new_value: "doing", timestamp: "2025-03-02T14:00:00Z" },
  { id: "hist-3", issue_id: "ISS-1", type: "assigned", actor: "alice", old_value: null, new_value: "max", timestamp: "2025-03-02T14:05:00Z" },
  { id: "hist-4", issue_id: "ISS-2", type: "created", actor: "alice", old_value: null, new_value: null, timestamp: "2025-03-03T09:00:00Z" },
  { id: "hist-5", issue_id: "ISS-2", type: "priority_changed", actor: "max", old_value: "medium", new_value: "high", timestamp: "2025-03-04T11:00:00Z" },
];

export function getHistory(issueId: string): HistoryEvent[] {
  return store.filter((e) => e.issue_id === issueId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function addHistoryEvent(issueId: string, type: HistoryEventType, actor: string, oldValue: string | null, newValue: string | null): HistoryEvent {
  const event: HistoryEvent = { id: genId(), issue_id: issueId, type, actor, old_value: oldValue, new_value: newValue, timestamp: new Date().toISOString() };
  store.push(event);
  return event;
}

export function recentHistory(limit = 20): HistoryEvent[] {
  return [...store].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
}

export function historyByActor(actor: string): HistoryEvent[] {
  return store.filter((e) => e.actor === actor).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function historyStats(issueId: string): { total_events: number; last_update: string | null; contributors: string[] } {
  const events = store.filter((e) => e.issue_id === issueId);
  const contributors = [...new Set(events.map((e) => e.actor))];
  const sorted = events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return {
    total_events: events.length,
    last_update: sorted[0]?.timestamp || null,
    contributors,
  };
}
