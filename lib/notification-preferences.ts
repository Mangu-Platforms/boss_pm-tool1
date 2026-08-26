export type NotificationChannel = "email" | "slack" | "in_app" | "webhook";
export type NotificationEventType = "issue_created" | "issue_updated" | "issue_assigned" | "comment_added" | "sprint_started" | "sprint_ended" | "milestone_completed" | "alert_triggered";

export type NotificationPreference = {
  id: string;
  user_id: string;
  event_type: NotificationEventType;
  channels: NotificationChannel[];
  enabled: boolean;
};

let nextId = 7;
function genId() { return `npref-${nextId++}`; }

const store: NotificationPreference[] = [
  { id: "npref-1", user_id: "max", event_type: "issue_created", channels: ["in_app", "email"], enabled: true },
  { id: "npref-2", user_id: "max", event_type: "issue_assigned", channels: ["in_app", "slack"], enabled: true },
  { id: "npref-3", user_id: "max", event_type: "comment_added", channels: ["in_app"], enabled: true },
  { id: "npref-4", user_id: "max", event_type: "alert_triggered", channels: ["email", "slack", "in_app"], enabled: true },
  { id: "npref-5", user_id: "alice", event_type: "issue_created", channels: ["email"], enabled: true },
  { id: "npref-6", user_id: "alice", event_type: "milestone_completed", channels: ["email", "in_app"], enabled: true },
];

export function listPreferences(userId: string): NotificationPreference[] {
  return store.filter((p) => p.user_id === userId);
}

export function getPreference(id: string): NotificationPreference | null {
  return store.find((p) => p.id === id) || null;
}

export function setPreference(userId: string, eventType: NotificationEventType, channels: NotificationChannel[], enabled = true): NotificationPreference {
  const existing = store.find((p) => p.user_id === userId && p.event_type === eventType);
  if (existing) {
    existing.channels = channels;
    existing.enabled = enabled;
    return existing;
  }
  const pref: NotificationPreference = { id: genId(), user_id: userId, event_type: eventType, channels, enabled };
  store.push(pref);
  return pref;
}

export function togglePreference(id: string): NotificationPreference | null {
  const p = store.find((pr) => pr.id === id);
  if (!p) return null;
  p.enabled = !p.enabled;
  return p;
}

export function deletePreference(id: string): boolean {
  const idx = store.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function shouldNotify(userId: string, eventType: NotificationEventType, channel: NotificationChannel): boolean {
  const pref = store.find((p) => p.user_id === userId && p.event_type === eventType);
  if (!pref || !pref.enabled) return false;
  return pref.channels.includes(channel);
}
