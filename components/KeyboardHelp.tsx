"use client";

import { useEffect, useState } from "react";

const shortcuts = [
  { key: "?", desc: "Toggle shortcuts panel" },
  { key: "Cmd+K", desc: "Open command palette" },
  { key: "C", desc: "Create new issue" },
  { key: "/", desc: "Focus search" },
  { key: "G then I", desc: "Go to Issues" },
  { key: "G then B", desc: "Go to Board" },
  { key: "G then R", desc: "Go to Roadmap" },
  { key: "G then A", desc: "Go to Analytics" },
  { key: "G then N", desc: "Go to Inbox" },
  { key: "G then H", desc: "Go to Home" },
  { key: "G then S", desc: "Go to Settings" },
  { key: "Esc", desc: "Close dialog / cancel edit" },
];

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let gPending = false;
    let timer: ReturnType<typeof setTimeout>;

    function handleKey(e: KeyboardEvent) {
      const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;

      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      if (inInput) return;

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }

      if (e.key === "g" || e.key === "G") {
        if (!e.metaKey && !e.ctrlKey) {
          gPending = true;
          clearTimeout(timer);
          timer = setTimeout(() => { gPending = false; }, 1000);
        }
        return;
      }

      if (gPending) {
        gPending = false;
        clearTimeout(timer);
        const routes: Record<string, string> = {
          i: "/issues", b: "/board", r: "/roadmap",
          a: "/analytics", n: "/inbox", h: "/", s: "/settings",
        };
        const route = routes[e.key.toLowerCase()];
        if (route) {
          e.preventDefault();
          window.location.href = route;
        }
        return;
      }

      if (e.key === "c" && !e.metaKey && !e.ctrlKey) {
        window.location.href = "/issues/new";
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      clearTimeout(timer);
    };
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
