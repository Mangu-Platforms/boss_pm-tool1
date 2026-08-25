"use client";

import { useEffect, useState } from "react";

type ToastItem = { id: string; message: string; type: "success" | "error" | "info" };

let listeners: ((t: ToastItem) => void)[] = [];

export function toast(message: string, type: ToastItem["type"] = "info") {
  const item: ToastItem = { id: crypto.randomUUID(), message, type };
  listeners.forEach((fn) => fn(item));
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (t: ToastItem) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== t.id));
      }, 3500);
    };
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((fn) => fn !== handler);
    };
  }, []);

  if (!items.length) return null;

  return (
    <div className="toast-container">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
