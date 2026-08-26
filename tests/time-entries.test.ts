import { describe, it, expect } from "vitest";
import {
  listTimeEntries,
  getTimeEntry,
  createTimeEntry,
  deleteTimeEntry,
  totalHours,
  hoursByMember,
} from "@/lib/time-entries";

describe("time-entries", () => {
  it("lists seed entries", () => {
    const entries = listTimeEntries();
    expect(entries.length).toBeGreaterThanOrEqual(4);
  });

  it("filters by issue_id", () => {
    const entries = listTimeEntries({ issue_id: "BOSS-1" });
    expect(entries.every((e) => e.issue_id === "BOSS-1")).toBe(true);
  });

  it("filters by member", () => {
    const entries = listTimeEntries({ member: "alice" });
    expect(entries.every((e) => e.member === "alice")).toBe(true);
  });

  it("creates an entry", () => {
    const entry = createTimeEntry("BOSS-99", "testuser", 2.5, "Testing", "2025-03-10");
    expect(entry.hours).toBe(2.5);
    expect(entry.member).toBe("testuser");
  });

  it("gets an entry by id", () => {
    const entries = listTimeEntries();
    const entry = getTimeEntry(entries[0].id);
    expect(entry).not.toBeNull();
  });

  it("deletes an entry", () => {
    const entry = createTimeEntry("BOSS-98", "del-user", 1, "To delete", "2025-03-10");
    expect(deleteTimeEntry(entry.id)).toBe(true);
    expect(deleteTimeEntry(entry.id)).toBe(false);
  });

  it("calculates total hours", () => {
    expect(totalHours()).toBeGreaterThan(0);
  });

  it("calculates hours by member", () => {
    const byMember = hoursByMember();
    expect(Object.keys(byMember).length).toBeGreaterThan(0);
    expect(byMember["alice"]).toBeGreaterThan(0);
  });
});
