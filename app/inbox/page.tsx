"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Notification } from "@/lib/notifications";

export default function InboxPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnread(data.unread_count || 0);
      });
  }, []);

  async function handleMarkRead(id: string) {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_read", id }),
    });
    if (res.ok) {
      const data = await res.json();
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      setUnread(data.unread_count);
    }
  }

  async function handleMarkAllRead() {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    }
  }

  const typeIcon: Record<string, string> = {
    mention: "@",
    assigned: "=",
    status_change: "~",
    comment: "#",
    due_soon: "!",
  };

  return (
    <main>
      <div className="kicker">Notifications</div>
      <h1>Inbox</h1>
      <p className="lede">
        {unread > 0 ? `${unread} unread notification${unread !== 1 ? "s" : ""}` : "All caught up."}
      </p>

      {unread > 0 && (
        <button className="chip" onClick={handleMarkAllRead} style={{ marginBottom: 16 }}>
          Mark all read
        </button>
      )}

      <div className="notif-list">
        {notifications.length === 0 && <p className="hint">No notifications yet.</p>}
        {notifications.map((n) => (
          <div key={n.id} className={`notif-item ${n.read ? "notif-read" : "notif-unread"}`}>
            <span className="notif-icon">{typeIcon[n.type] || "?"}</span>
            <div className="notif-body">
              <Link href={`/issues/${n.issue_id}`} className="notif-title">
                {n.issue_title}
              </Link>
              <span className="notif-message">{n.message}</span>
            </div>
            <span className="notif-time">{new Date(n.created_at).toLocaleDateString()}</span>
            {!n.read && (
              <button className="chip chip-sm" onClick={() => handleMarkRead(n.id)}>read</button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
