import { describe, it, expect } from "vitest";
import { logTime, listTimeEntries, totalMinutes, removeTimeEntry, allTimeEntries } from "@/lib/timelog";

describe("timelog", () => {
  const issueId = "time-test-" + Math.random().toString(36).slice(2);

  it("logs time", () => {
    const entry = logTime(issueId, 30, "initial spike");
    expect(entry.minutes).toBe(30);
    expect(entry.note).toBe("initial spike");
    expect(entry.issue_id).toBe(issueId);
  });

  it("lists entries for an issue", () => {
    logTime(issueId, 60, "implementation");
    const entries = listTimeEntries(issueId);
    expect(entries.length).toBe(2);
  });

  it("calculates total minutes", () => {
    expect(totalMinutes(issueId)).toBe(90);
  });

  it("removes an entry", () => {
    const entries = listTimeEntries(issueId);
    expect(removeTimeEntry(entries[0].id)).toBe(true);
    expect(totalMinutes(issueId)).toBe(30);
  });

  it("returns false for unknown removal", () => {
    expect(removeTimeEntry("fake-id")).toBe(false);
  });

  it("lists all entries across issues", () => {
    logTime("other-issue", 15, "quick fix");
    const all = allTimeEntries();
    expect(all.length).toBeGreaterThanOrEqual(2);
  });
});
