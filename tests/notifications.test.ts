import { describe, it, expect } from "vitest";
import { createNotification, listNotifications, markRead, markAllRead, unreadCount } from "@/lib/notifications";

describe("notifications", () => {
  it("creates a notification", () => {
    const n = createNotification("assigned", "iss-1", "Test issue", "Assigned to alice");
    expect(n.type).toBe("assigned");
    expect(n.read).toBe(false);
    expect(n.issue_id).toBe("iss-1");
  });

  it("lists notifications newest first", () => {
    createNotification("comment", "iss-2", "Second issue", "New comment");
    const list = listNotifications();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list[0].created_at >= list[1].created_at).toBe(true);
  });

  it("filters unread only", () => {
    const unread = listNotifications({ unread_only: true });
    expect(unread.every((n) => !n.read)).toBe(true);
  });

  it("marks a single notification read", () => {
    const list = listNotifications();
    expect(markRead(list[0].id)).toBe(true);
    const updated = listNotifications();
    const found = updated.find((n) => n.id === list[0].id);
    expect(found?.read).toBe(true);
  });

  it("counts unread", () => {
    const count = unreadCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it("marks all read", () => {
    const marked = markAllRead();
    expect(marked).toBeGreaterThanOrEqual(1);
    expect(unreadCount()).toBe(0);
  });

  it("returns false for unknown mark", () => {
    expect(markRead("fake-id")).toBe(false);
  });
});
