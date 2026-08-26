import { describe, it, expect } from "vitest";
import { listStandups, getStandup, createStandup, deleteStandup, getStandupDates } from "@/lib/standups";

describe("standups", () => {
  it("lists default standups", () => {
    const standups = listStandups();
    expect(standups.length).toBeGreaterThanOrEqual(3);
  });

  it("filters by date", () => {
    const standups = listStandups("2025-03-10");
    expect(standups.length).toBeGreaterThanOrEqual(3);
    for (const s of standups) {
      expect(s.date).toBe("2025-03-10");
    }
  });

  it("creates a standup entry", () => {
    const s = createStandup("Eve", "Fixed bugs", "Writing tests", "None", "2025-03-11");
    expect(s.member).toBe("Eve");
    expect(s.date).toBe("2025-03-11");
  });

  it("gets standup by id", () => {
    const s = getStandup("su-1");
    expect(s).toBeTruthy();
    expect(s!.member).toBe("Max");
  });

  it("deletes a standup", () => {
    const s = createStandup("Delete Me", "", "", "");
    expect(deleteStandup(s.id)).toBe(true);
    expect(getStandup(s.id)).toBeNull();
  });

  it("returns standup dates", () => {
    const dates = getStandupDates();
    expect(dates.length).toBeGreaterThan(0);
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1] >= dates[i]).toBe(true);
    }
  });
});
