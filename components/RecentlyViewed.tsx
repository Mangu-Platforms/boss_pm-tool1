"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ViewedItem = { id: string; title: string; viewedAt: number };

const STORAGE_KEY = "boss-pm-recently-viewed";
const MAX_ITEMS = 8;

export function recordView(id: string, title: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items: ViewedItem[] = raw ? JSON.parse(raw) : [];
    const filtered = items.filter((i) => i.id !== id);
    filtered.unshift({ id, title, viewedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch {
    // localStorage unavailable
  }
}

export function RecentlyViewed() {
  const [items, setItems] = useState<ViewedItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="recently-viewed">
      <span className="hint">Recent:</span>
      {items.slice(0, 5).map((item) => (
        <Link key={item.id} href={`/issues/${item.id}`} className="chip chip-sm">
          {item.title.length > 30 ? item.title.slice(0, 30) + "…" : item.title}
        </Link>
      ))}
    </div>
  );
}
