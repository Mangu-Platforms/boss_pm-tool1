import { describe, it, expect } from "vitest";
import { listAvailability, setAvailability, teamCapacity, weeklyCapacity } from "../lib/team-availability";

describe("team-availability", () => {
  it("lists all availability", () => {
    const all = listAvailability();
    expect(all.length).toBeGreaterThanOrEqual(6);
  });

  it("filters by member", () => {
    const maxAvail = listAvailability("max");
    expect(maxAvail.every((a) => a.member === "max")).toBe(true);
  });

  it("filters by date", () => {
    const avail = listAvailability(undefined, "2025-09-01");
    expect(avail.every((a) => a.date === "2025-09-01")).toBe(true);
  });

  it("sets new availability", () => {
    const a = setAvailability("carol", "2025-09-03", "available", 8, "Full day");
    expect(a.member).toBe("carol");
    expect(a.hours).toBe(8);
  });

  it("updates existing availability", () => {
    setAvailability("carol", "2025-09-03", "partial", 4, "Half day");
    const avail = listAvailability("carol", "2025-09-03");
    expect(avail[0].status).toBe("partial");
    expect(avail[0].hours).toBe(4);
  });

  it("calculates team capacity", () => {
    const cap = teamCapacity("2025-09-01");
    expect(typeof cap.total_hours).toBe("number");
    expect(typeof cap.available_members).toBe("number");
    expect(cap.off_members).toContain("bob");
  });

  it("calculates weekly capacity", () => {
    const weekly = weeklyCapacity("max", "2025-09-01");
    expect(weekly.dates.length).toBe(5);
    expect(typeof weekly.total_hours).toBe("number");
  });
});
