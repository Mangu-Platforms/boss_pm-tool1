export type Notification = {
  id: string;
  type: "mention" | "assigned" | "status_change" | "comment" | "due_soon";
  issue_id: string;
  issue_title: string;
  message: string;
  read: boolean;
  created_at: string;
};

const store: Notification[] = [];

export function createNotification(
  type: Notification["type"],
  issueId: string,
  issueTitle: string,
  message: string
): Notification {
  const notif: Notification = {
    id: crypto.randomUUID(),
    type,
    issue_id: issueId,
    issue_title: issueTitle,
    message,
    read: false,
    created_at: new Date().toISOString(),
  };
  store.push(notif);
  return notif;
}

export function listNotifications(opts?: { unread_only?: boolean }): Notification[] {
  const items = opts?.unread_only ? store.filter((n) => !n.read) : store;
  return [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function markRead(id: string): boolean {
  const n = store.find((n) => n.id === id);
  if (!n) return false;
  n.read = true;
  return true;
}

export function markAllRead(): number {
  let count = 0;
  for (const n of store) {
    if (!n.read) {
      n.read = true;
      count++;
    }
  }
  return count;
}

export function unreadCount(): number {
  return store.filter((n) => !n.read).length;
}
