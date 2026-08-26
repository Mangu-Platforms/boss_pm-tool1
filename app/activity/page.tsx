"use client";

import { useEffect, useState } from "react";
import type { ActivityEvent } from "@/lib/activity";

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity?limit=100")
      .then((r) => r.json())
      .then((data) => setEvents(data.events || []))
      .finally(() => setLoading(false));
  }, []);

  const actionIcon: Record<string, string> = {
    created: "+",
    status_changed: "~",
    assigned: "@",
    updated: "^",
    deleted: "x",
  };

  return (
    <main>
      <div className="kicker">Timeline</div>
      <h1>Activity</h1>
      <p className="lede">Recent changes across the portfolio.</p>

      {loading ? (
        <p className="empty">Loading...</p>
      ) : events.length === 0 ? (
        <p className="empty">No activity yet. Create or update an issue to see events here.</p>
      ) : (
        <div className="activity-list">
          {events.map((e) => (
            <div key={e.id} className="activity-item">
              <span className={`activity-icon action-${e.action}`}>
                {actionIcon[e.action] || "·"}
              </span>
              <div className="activity-body">
                <span className="activity-detail">{e.detail}</span>
                <span className="activity-meta">
                  {e.action} · {new Date(e.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
