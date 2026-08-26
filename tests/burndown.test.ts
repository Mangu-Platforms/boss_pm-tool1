import { describe, it, expect } from "vitest";
import { calculateBurndown, sprintVelocity, burndownSummary } from "@/lib/burndown";
import { createSprint, addIssueToSprint } from "@/lib/sprints";

describe("burndown", () => {
  it("returns empty for sprint with no issues", () => {
    const sp = createSprint("BD-Empty", "", "2025-10-01", "2025-10-14");
    const points = calculateBurndown(sp.id, sp.start_date, "2025-10-14", [], "2025-10-07");
    expect(points).toEqual([]);
  });

  it("calculates ideal line decreasing to zero", () => {
    const sp = createSprint("BD-Ideal", "", "2025-10-01", "2025-10-08");
    addIssueToSprint(sp.id, "bd-i1");
    addIssueToSprint(sp.id, "bd-i2");
    addIssueToSprint(sp.id, "bd-i3");
    addIssueToSprint(sp.id, "bd-i4");
    const points = calculateBurndown(sp.id, sp.start_date, sp.end_date, [], "2025-10-01");
    expect(points[0].ideal).toBe(4);
    expect(points[points.length - 1].ideal).toBe(0);
  });

  it("shows remaining decreasing as items are done", () => {
    const sp = createSprint("BD-Done", "", "2025-11-01", "2025-11-08");
    addIssueToSprint(sp.id, "bd-d1");
    addIssueToSprint(sp.id, "bd-d2");
    const points = calculateBurndown(sp.id, sp.start_date, sp.end_date, ["bd-d1"], "2025-11-04");
    expect(points[0].remaining).toBe(2);
    const midpoint = points[Math.floor(points.length / 2)];
    expect(midpoint.remaining).toBeLessThan(2);
  });

  it("includes correct number of days", () => {
    const sp = createSprint("BD-Days", "", "2025-12-01", "2025-12-15");
    addIssueToSprint(sp.id, "bd-days1");
    const points = calculateBurndown(sp.id, sp.start_date, sp.end_date, [], "2025-12-01");
    expect(points.length).toBe(15);
  });

  it("returns burndown summary for all sprints", () => {
    const summary = burndownSummary();
    expect(summary.length).toBeGreaterThan(0);
    summary.forEach((s) => {
      expect(s.sprint_id).toBeDefined();
      expect(s.sprint_name).toBeDefined();
      expect(typeof s.total_issues).toBe("number");
    });
  });

  it("calculates sprint velocity", () => {
    const sp = createSprint("BD-Vel", "", "2025-12-01", "2025-12-14");
    addIssueToSprint(sp.id, "bd-v1");
    addIssueToSprint(sp.id, "bd-v2");
    addIssueToSprint(sp.id, "bd-v3");
    const v = sprintVelocity(sp.id, ["bd-v1", "bd-v2"]);
    expect(v.total).toBe(3);
    expect(v.completed).toBe(2);
    expect(v.velocity).toBe(2);
  });
});
