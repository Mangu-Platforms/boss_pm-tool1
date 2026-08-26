import { describe, it, expect } from "vitest";
import { listNotifications, getNotification, createNotification, markRead, markAllRead, unreadCount, deleteNotification } from "../lib/notifications-center";

describe("notifications-center", () => {
  it("lists notifications for user", () => {
    const notifs = listNotifications("max");
    expect(notifs.length).toBeGreaterThanOrEqual(4);
  });

  it("returns newest first", () => {
    const notifs = listNotifications("max");
    for (let i = 1; i < notifs.length; i++) {
      expect(notifs[i - 1].created_at >= notifs[i].created_at).toBe(true);
    }
  });

  it("filters unread only", () => {
    const unread = listNotifications("max", true);
    expect(unread.every((n) => !n.read)).toBe(true);
  });

  it("creates notification", () => {
    const n = createNotification("max", "comment_added", "New comment", "Test msg", "BOSS-10");
    expect(n.read).toBe(false);
  });

  it("marks as read", () => {
    const n = createNotification("max", "issue_assigned", "Test", "Test", "t-1");
    expect(markRead(n.id)).toBe(true);
    expect(getNotification(n.id)!.read).toBe(true);
  });

  it("marks all read", () => {
    createNotification("charlie", "sprint_started", "Sprint", "Started", "s-1");
    createNotification("charlie", "approval_needed", "Approve", "Please", "a-1");
    const count = markAllRead("charlie");
    expect(count).toBeGreaterThanOrEqual(2);
    expect(unreadCount("charlie")).toBe(0);
  });

  it("counts unread", () => {
    const count = unreadCount("max");
    expect(typeof count).toBe("number");
  });

  it("deletes notification", () => {
    const n = createNotification("max", "status_changed", "Del", "Del", "d-1");
    expect(deleteNotification(n.id)).toBe(true);
    expect(getNotification(n.id)).toBeNull();
  });
});
