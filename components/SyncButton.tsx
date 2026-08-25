"use client";

import { useState } from "react";

type Props = {
  slug?: string;
  onSynced?: (data: { links: unknown[]; mirrored: number }) => void;
};

export function SyncButton({ slug, onSynced }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function sync() {
    setSyncing(true);
    setMsg(null);
    try {
      const res = await fetch("/api/sync/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slug ? { slug } : {}),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Sync failed");
        return;
      }
      const total = data.results?.reduce(
        (acc: number, r: { ok: boolean; count?: number }) => acc + (r.ok ? r.count || 0 : 0),
        0
      );
      setMsg(`Synced ${total} issues · mirrored ${data.mirrored} statuses`);
      onSynced?.(data);
    } catch {
      setMsg("Network error during sync");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="sync-row">
      <button className="chip sync-btn" onClick={sync} disabled={syncing} type="button">
        {syncing ? "Syncing…" : "Sync GitHub"}
      </button>
      {msg && <span className="hint">{msg}</span>}
    </div>
  );
}
