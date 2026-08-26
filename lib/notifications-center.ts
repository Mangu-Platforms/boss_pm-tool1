export type NotificationType = "issue_assigned" | "issue_mentioned" | "comment_added" | "sprint_started" | "approval_needed" | "deadline_approaching" | "status_changed";

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  source_id: string;
  read: boolean;
  created_at: string;
};

let nextId = 9;
function genId() { return `notif-${nextId++}`; }

const store: Notification[] = [
  { id: "notif-1", user_id: "max", type: "issue_assigned", title: "Issue assigned to you", message: "BOSS-1 has been assigned to you", source_id: "BOSS-1", read: false, created_at: "2025-03-22T10:00:00Z" },
  { id: "notif-2", user_id: "max", type: "comment_added", title: "New comment", message: "alice commented on BOSS-2", source_id: "BOSS-2", read: false, created_at: "2025-03-22T09:00:00Z" },
  { id: "notif-3", user_id: "max", type: "deadline_approaching", title: "Deadline approaching", message: "BOSS-3 is due tomorrow", source_id: "BOSS-3", read: true, created_at: "2025-03-21T10:00:00Z" },
  { id: "notif-4", user_id: "alice", type: "sprint_started", title: "Sprint started", message: "Sprint 3 has begun", source_id: "sprint-3", read: false, created_at: "2025-03-22T08:00:00Z" },
  { id: "notif-5", user_id: "max", type: "approval_needed", title: "Approval needed", message: "Release v2.1 needs your approval", source_id: "rel-1", read: false, created_at: "2025-03-22T11:00:00Z" },
  { id: "notif-6", user_id: "bob", type: "issue_mentioned", title: "You were mentioned", message: "max mentioned you in BOSS-5", source_id: "BOSS-5", read: false, created_at: "2025-03-22T10:30:00Z" },
  { id: "notif-7", user_id: "max", type: "status_changed", title: "Status updated", message: "BOSS-4 moved to done", source_id: "BOSS-4", read: true, created_at: "2025-03-20T10:00:00Z" },
  { id: "notif-8", user_id: "alice", type: "issue_assigned", title: "Issue assigned", message: "BOSS-6 assigned to you", source_id: "BOSS-6", read: true, created_at: "2025-03-19T10:00:00Z" },
];

export function listNotifications(userId: string, unreadOnly?: boolean): Notification[] {
  let result = store.filter((n) => n.user_id === userId);
  if (unreadOnly) result = result.filter((n) => !n.read);
  return result.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getNotification(id: string): Notification | null {
  return store.find((n) => n.id === id) || null;
}

export function createNotification(userId: string, type: NotificationType, title: string, message: string, sourceId: string): Notification {
  const notif: Notification = { id: genId(), user_id: userId, type, title, message, source_id: sourceId, read: false, created_at: new Date().toISOString() };
  store.push(notif);
  return notif;
}

export function markRead(id: string): boolean {
  const n = store.find((notif) => notif.id === id);
  if (!n) return false;
  n.read = true;
  return true;
}

export function markAllRead(userId: string): number {
  let count = 0;
  store.forEach((n) => {
    if (n.user_id === userId && !n.read) { n.read = true; count++; }
  });
  return count;
}

export function unreadCount(userId: string): number {
  return store.filter((n) => n.user_id === userId && !n.read).length;
}

export function deleteNotification(id: string): boolean {
  const idx = store.findIndex((n) => n.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}
