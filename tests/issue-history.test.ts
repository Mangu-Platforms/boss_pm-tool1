import { describe, it, expect } from "vitest";
import { getHistory, addHistoryEvent, recentHistory, historyByActor, historyStats } from "../lib/issue-history";

describe("issue-history", () => {
  it("gets history for issue", () => {
    const history = getHistory("ISS-1");
    expect(history.length).toBeGreaterThanOrEqual(3);
  });

  it("history is sorted chronologically", () => {
    const history = getHistory("ISS-1");
    for (let i = 1; i < history.length; i++) {
      expect(history[i - 1].timestamp <= history[i].timestamp).toBe(true);
    }
  });

  it("adds history event", () => {
    const event = addHistoryEvent("ISS-1", "commented", "bob", null, "Great work!");
    expect(event.type).toBe("commented");
    expect(event.actor).toBe("bob");
  });

  it("returns recent history", () => {
    const recent = recentHistory(5);
    expect(recent.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < recent.length; i++) {
      expect(recent[i - 1].timestamp >= recent[i].timestamp).toBe(true);
    }
  });

  it("filters by actor", () => {
    const maxHistory = historyByActor("max");
    expect(maxHistory.every((e) => e.actor === "max")).toBe(true);
  });

  it("returns history stats", () => {
    const stats = historyStats("ISS-1");
    expect(stats.total_events).toBeGreaterThan(0);
    expect(stats.contributors.length).toBeGreaterThan(0);
    expect(stats.last_update).toBeDefined();
  });
});
