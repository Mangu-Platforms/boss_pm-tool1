import { describe, it, expect } from "vitest";
import { listPulses, addPulse, averageRating, pulseTrend, userPulses } from "../lib/team-pulse";

describe("team-pulse", () => {
  it("lists all pulses", () => {
    const pulses = listPulses();
    expect(pulses.length).toBeGreaterThanOrEqual(6);
  });

  it("filters by sprint", () => {
    const pulses = listPulses("sprint-1");
    expect(pulses.every((p) => p.sprint_id === "sprint-1")).toBe(true);
  });

  it("adds a pulse", () => {
    const p = addPulse("charlie", 4, "Feeling good", "sprint-3");
    expect(p.rating).toBe(4);
    expect(p.user_id).toBe("charlie");
  });

  it("calculates average rating", () => {
    const avg = averageRating("sprint-1");
    expect(avg).toBeGreaterThan(0);
    expect(avg).toBeLessThanOrEqual(5);
  });

  it("returns pulse trend", () => {
    const trend = pulseTrend();
    expect(trend.length).toBeGreaterThan(0);
    trend.forEach((t) => {
      expect(t.avg_rating).toBeGreaterThan(0);
      expect(t.count).toBeGreaterThan(0);
    });
  });

  it("filters by user", () => {
    const pulses = userPulses("max");
    expect(pulses.every((p) => p.user_id === "max")).toBe(true);
  });
});
