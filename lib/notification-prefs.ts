export type NotificationChannel = "in_app" | "email" | "slack";

export type NotificationPref = {
  user_id: string;
  event: string;
  channels: NotificationChannel[];
  enabled: boolean;
};

const defaultEvents = [
  "issue.assigned",
  "issue.status_changed",
  "issue.comment_added",
  "issue.mentioned",
  "sprint.started",
  "sprint.completed",
  "milestone.due_soon",
  "release.published",
  "sla.breached",
  "automation.triggered",
];

const store: NotificationPref[] = [];

function ensureDefaults(userId: string) {
  if (store.some((p) => p.user_id === userId)) return;
  for (const event of defaultEvents) {
    store.push({
      user_id: userId,
      event,
      channels: ["in_app"],
      enabled: true,
    });
  }
}

export function getPrefs(userId: string): NotificationPref[] {
  ensureDefaults(userId);
  return store.filter((p) => p.user_id === userId);
}

export function updatePref(userId: string, event: string, channels: NotificationChannel[], enabled: boolean): NotificationPref {
  ensureDefaults(userId);
  const existing = store.find((p) => p.user_id === userId && p.event === event);
  if (existing) {
    existing.channels = channels;
    existing.enabled = enabled;
    return existing;
  }
  const pref: NotificationPref = { user_id: userId, event, channels, enabled };
  store.push(pref);
  return pref;
}

export function muteAll(userId: string): void {
  ensureDefaults(userId);
  for (const p of store) {
    if (p.user_id === userId) p.enabled = false;
  }
}

export function unmuteAll(userId: string): void {
  ensureDefaults(userId);
  for (const p of store) {
    if (p.user_id === userId) p.enabled = true;
  }
}

export function listEvents(): string[] {
  return [...defaultEvents];
}
