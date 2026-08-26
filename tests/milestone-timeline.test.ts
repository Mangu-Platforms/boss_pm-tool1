import { describe, it, expect } from "vitest";
import { milestoneTimeline, upcomingMilestones, overdueMilestones, timelineStats } from "../lib/milestone-timeline";

describe("milestone-timeline", () => {
  it("returns timeline events", () => {
    const events = milestoneTimeline();
    expect(events.length).toBeGreaterThan(0);
  });

  it("events are sorted by date", () => {
    const events = milestoneTimeline();
    for (let i = 1; i < events.length; i++) {
      expect(events[i - 1].date <= events[i].date).toBe(true);
    }
  });

  it("returns upcoming milestones", () => {
    const upcoming = upcomingMilestones(365);
    expect(Array.isArray(upcoming)).toBe(true);
  });

  it("returns overdue milestones", () => {
    const overdue = overdueMilestones();
    expect(Array.isArray(overdue)).toBe(true);
    overdue.forEach((e) => {
      expect(e.status).not.toBe("completed");
    });
  });

  it("returns timeline stats", () => {
    const stats = timelineStats();
    expect(typeof stats.total).toBe("number");
    expect(typeof stats.upcoming).toBe("number");
    expect(typeof stats.overdue).toBe("number");
    expect(typeof stats.completed).toBe("number");
  });
});
