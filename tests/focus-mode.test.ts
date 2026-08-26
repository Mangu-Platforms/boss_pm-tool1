import { describe, it, expect } from "vitest";
import { listSessions, getSession, startFocus, completeFocus, endSession, focusStats, activeSession } from "../lib/focus-mode";

describe("focus-mode", () => {
  it("lists all sessions", () => {
    const sessions = listSessions();
    expect(sessions.length).toBeGreaterThanOrEqual(4);
  });

  it("filters by user", () => {
    const sessions = listSessions("max");
    expect(sessions.every((s) => s.user_id === "max")).toBe(true);
  });

  it("starts a focus session", () => {
    const s = startFocus("charlie", "BOSS-5", 30, 10);
    expect(s.status).toBe("focusing");
    expect(s.duration_minutes).toBe(30);
  });

  it("completes a pomodoro", () => {
    const s = startFocus("dave", null);
    const completed = completeFocus(s.id);
    expect(completed).not.toBeNull();
    expect(completed!.status).toBe("break");
    expect(completed!.pomodoros_completed).toBe(1);
  });

  it("ends a session", () => {
    const s = startFocus("eve", "BOSS-1");
    const ended = endSession(s.id);
    expect(ended).not.toBeNull();
    expect(ended!.status).toBe("idle");
    expect(ended!.completed_at).not.toBeNull();
  });

  it("gets focus stats", () => {
    const stats = focusStats("max");
    expect(stats.total_sessions).toBeGreaterThanOrEqual(2);
    expect(typeof stats.total_pomodoros).toBe("number");
    expect(typeof stats.total_focus_minutes).toBe("number");
  });

  it("finds active session", () => {
    const s = startFocus("frank", null);
    const active = activeSession("frank");
    expect(active).not.toBeNull();
    expect(active!.id).toBe(s.id);
  });
});
