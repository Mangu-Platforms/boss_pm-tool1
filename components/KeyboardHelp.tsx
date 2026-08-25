"use client";

import { useEffect, useState } from "react";

const shortcuts = [
  { key: "C", desc: "Focus create form" },
  { key: "/", desc: "Focus search" },
  { key: "?", desc: "Toggle shortcuts" },
  { key: "1", desc: "Go to Portfolio" },
  { key: "2", desc: "Go to Kanban" },
  { key: "3", desc: "Go to Issues" },
];

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "?" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div className="kbd-overlay" onClick={() => setOpen(false)}>
      <div className="kbd-panel" onClick={(e) => e.stopPropagation()}>
        <div className="kbd-header">
          <span>Keyboard shortcuts</span>
          <button className="kbd-close" onClick={() => setOpen(false)} type="button">&times;</button>
        </div>
        <div className="kbd-list">
          {shortcuts.map((s) => (
            <div key={s.key} className="kbd-row">
              <kbd className="kbd-key">{s.key}</kbd>
              <span>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
