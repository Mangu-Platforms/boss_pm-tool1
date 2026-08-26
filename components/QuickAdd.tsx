"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SearchResult = { type: string; id: string; title: string; url: string; status?: string; slug?: string };

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
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
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setSelected(0);
      } catch {
        setResults([]);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  const commands = [
    { label: "Create Issue", path: "/issues/new", shortcut: "C" },
    { label: "Kanban Board", path: "/board", shortcut: "2" },
    { label: "Issues List", path: "/issues", shortcut: "3" },
    { label: "Agents", path: "/agents", shortcut: "" },
    { label: "Roadmap", path: "/roadmap", shortcut: "" },
    { label: "Analytics", path: "/analytics", shortcut: "" },
    { label: "Activity Feed", path: "/activity", shortcut: "" },
    { label: "Settings", path: "/settings", shortcut: "" },
    { label: "New Product", path: "/products/new", shortcut: "" },
    { label: "Portfolio", path: "/", shortcut: "1" },
  ];

  const filteredCommands = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const allItems = [
    ...results.map((r) => ({ label: r.title, path: r.url, shortcut: "", type: r.type, status: r.status })),
    ...filteredCommands.map((c) => ({ ...c, type: "command", status: undefined })),
  ];

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
          placeholder="Search issues, products, or navigate..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && allItems.length > 0) {
              go(allItems[selected]?.path || allItems[0].path);
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSelected((s) => Math.min(s + 1, allItems.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setSelected((s) => Math.max(s - 1, 0));
            }
          }}
        />
        <div className="quickadd-list">
          {allItems.map((item, idx) => (
            <button
              key={`${item.type}-${item.path}-${idx}`}
              className={`quickadd-item ${idx === selected ? "quickadd-selected" : ""}`}
              onClick={() => go(item.path)}
              type="button"
            >
              <span className="quickadd-item-content">
                {item.type !== "command" && (
                  <span className={`quickadd-type quickadd-type-${item.type}`}>{item.type}</span>
                )}
                <span>{item.label}</span>
                {item.status && <span className="quickadd-status">{item.status}</span>}
              </span>
              {item.shortcut && <kbd className="quickadd-kbd">{item.shortcut}</kbd>}
            </button>
          ))}
          {allItems.length === 0 && <div className="quickadd-empty">No matches</div>}
        </div>
      </div>
    </div>
  );
}
