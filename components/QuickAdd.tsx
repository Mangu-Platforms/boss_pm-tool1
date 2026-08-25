"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "k" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const commands = [
    { label: "Create Issue", path: "/issues/new", shortcut: "C" },
    { label: "Kanban Board", path: "/board", shortcut: "2" },
    { label: "Issues List", path: "/issues", shortcut: "3" },
    { label: "Analytics", path: "/analytics", shortcut: "" },
    { label: "Activity Feed", path: "/activity", shortcut: "" },
    { label: "Settings", path: "/settings", shortcut: "" },
    { label: "New Product", path: "/products/new", shortcut: "" },
    { label: "Portfolio", path: "/", shortcut: "1" },
  ];

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  function go(path: string) {
    setOpen(false);
    router.push(path);
  }

  if (!open) return null;

  return (
    <div className="quickadd-overlay" onClick={() => setOpen(false)}>
      <div className="quickadd-panel" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="quickadd-input"
          placeholder="Go to..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filtered.length > 0) {
              go(filtered[0].path);
            }
          }}
        />
        <div className="quickadd-list">
          {filtered.map((cmd) => (
            <button key={cmd.path} className="quickadd-item" onClick={() => go(cmd.path)} type="button">
              <span>{cmd.label}</span>
              {cmd.shortcut && <kbd className="quickadd-kbd">{cmd.shortcut}</kbd>}
            </button>
          ))}
          {filtered.length === 0 && <div className="quickadd-empty">No matches</div>}
        </div>
      </div>
    </div>
  );
}
