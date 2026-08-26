"use client";

import { useEffect, useState } from "react";

type Notification = { id: string; type: string; title: string; message: string; read: boolean; created_at: string };

const typeIcons: Record<string, string> = {
  issue_assigned: "A", comment_added: "C", deadline_approaching: "D",
  sprint_started: "S", approval_needed: "!", issue_mentioned: "@", status_changed: "~",
};

export default function NotificationsCenterPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  function load() {
    fetch("/api/notifications-center").then((r) => r.json()).then(setNotifs);
    fetch("/api/notifications-center?count").then((r) => r.json()).then((d) => setUnreadCount(d.unread));
  }
  useEffect(load, []);

  async function markRead(id: string) {
    await fetch("/api/notifications-center", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_read", id }),
    });
    load();
  }

  async function markAllRead() {
    await fetch("/api/notifications-center", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    load();
  }

  return (
    <div className="page">
      <div className="nc-header">
        <h1>Notifications {unreadCount > 0 && <span className="nc-badge">{unreadCount}</span>}</h1>
        {unreadCount > 0 && <button className="btn btn-sm" onClick={markAllRead}>Mark all read</button>}
      </div>

      <div className="nc-list">
        {notifs.map((n) => (
          <div key={n.id} className={`nc-item ${n.read ? "nc-read" : "nc-unread"}`} onClick={() => !n.read && markRead(n.id)}>
            <span className="nc-icon">{typeIcons[n.type] || "?"}</span>
            <div className="nc-content">
              <div className="nc-title">{n.title}</div>
              <div className="nc-message">{n.message}</div>
              <div className="nc-time">{new Date(n.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
