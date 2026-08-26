"use client";

import { useEffect, useState } from "react";

type NotificationPref = {
  user_id: string;
  event: string;
  channels: string[];
  enabled: boolean;
};

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<NotificationPref[]>([]);

  useEffect(() => {
    fetch("/api/notification-prefs")
      .then((r) => r.json())
      .then((data) => setPrefs(data.prefs || []));
  }, []);

  async function togglePref(event: string, enabled: boolean) {
    const pref = prefs.find((p) => p.event === event);
    await fetch("/api/notification-prefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, channels: pref?.channels || ["in_app"], enabled }),
    });
    setPrefs((prev) => prev.map((p) =>
      p.event === event ? { ...p, enabled } : p
    ));
  }

  async function toggleChannel(event: string, channel: string) {
    const pref = prefs.find((p) => p.event === event);
    if (!pref) return;
    const channels = pref.channels.includes(channel)
      ? pref.channels.filter((c) => c !== channel)
      : [...pref.channels, channel];
    await fetch("/api/notification-prefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, channels, enabled: pref.enabled }),
    });
    setPrefs((prev) => prev.map((p) =>
      p.event === event ? { ...p, channels } : p
    ));
  }

  async function handleMuteAll() {
    await fetch("/api/notification-prefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mute_all" }),
    });
    setPrefs((prev) => prev.map((p) => ({ ...p, enabled: false })));
  }

  async function handleUnmuteAll() {
    await fetch("/api/notification-prefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unmute_all" }),
    });
    setPrefs((prev) => prev.map((p) => ({ ...p, enabled: true })));
  }

  const allChannels = ["in_app", "email", "slack"];

  return (
    <main>
      <div className="kicker">Preferences</div>
      <h1>Notification Settings</h1>
      <p className="lede">Configure which events you want to be notified about and how.</p>

      <div className="notif-actions">
        <button className="chip" onClick={handleMuteAll}>Mute all</button>
        <button className="chip go" onClick={handleUnmuteAll}>Unmute all</button>
      </div>

      <div className="notif-list">
        {prefs.map((pref) => (
          <div key={pref.event} className={`notif-pref ${!pref.enabled ? "notif-disabled" : ""}`}>
            <div className="notif-pref-header">
              <button
                className={`auto-toggle ${pref.enabled ? "auto-on" : ""}`}
                onClick={() => togglePref(pref.event, !pref.enabled)}
              />
              <span className="notif-event">{formatEventName(pref.event)}</span>
            </div>
            {pref.enabled && (
              <div className="notif-channels">
                {allChannels.map((ch) => (
                  <button
                    key={ch}
                    className={`chip chip-sm ${pref.channels.includes(ch) ? "go" : ""}`}
                    onClick={() => toggleChannel(pref.event, ch)}
                  >
                    {ch.replace("_", " ")}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

function formatEventName(event: string): string {
  return event.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
