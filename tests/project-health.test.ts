import { describe, it, expect } from "vitest";
import { projectHealth } from "../lib/project-health";

describe("project-health", () => {
  it("returns health score", () => {
    const h = projectHealth();
    expect(h.overall).toBeGreaterThanOrEqual(0);
    expect(h.overall).toBeLessThanOrEqual(100);
  });

  it("has valid indicator", () => {
    const h = projectHealth();
    expect(["excellent", "good", "at_risk", "critical"]).toContain(h.indicator);
  });

  it("has breakdown scores", () => {
    const h = projectHealth();
    expect(h.breakdown.velocity.score).toBeDefined();
    expect(h.breakdown.backlog_health.score).toBeDefined();
    expect(h.breakdown.overdue.score).toBeDefined();
    expect(h.breakdown.milestone_progress.score).toBeDefined();
    expect(h.breakdown.team_load.score).toBeDefined();
  });

  it("has labels in breakdown", () => {
    const h = projectHealth();
    for (const key of Object.keys(h.breakdown) as (keyof typeof h.breakdown)[]) {
      expect(h.breakdown[key].label).toBeDefined();
      expect(h.breakdown[key].label.length).toBeGreaterThan(0);
    }
  });

  it("recommendations is array", () => {
    const h = projectHealth();
    expect(Array.isArray(h.recommendations)).toBe(true);
  });
});
