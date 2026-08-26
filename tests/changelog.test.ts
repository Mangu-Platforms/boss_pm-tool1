import { describe, it, expect } from "vitest";
import { listChangelog, getChangelogEntry, createChangelogEntry, publishChangelogEntry, deleteChangelogEntry } from "@/lib/changelog";

describe("changelog", () => {
  it("lists default entries", () => {
    const entries = listChangelog();
    expect(entries.length).toBeGreaterThanOrEqual(3);
  });

  it("gets entry by id", () => {
    expect(getChangelogEntry("cl-1")).toBeTruthy();
  });

  it("creates a draft entry", () => {
    const entry = createChangelogEntry("1.0.0", "Big Release", "lots of changes", "feature");
    expect(entry.published).toBe(false);
    expect(entry.category).toBe("feature");
  });

  it("publishes an entry", () => {
    const entry = createChangelogEntry("1.1.0", "Patch", "fixes");
    const published = publishChangelogEntry(entry.id);
    expect(published!.published).toBe(true);
    expect(published!.published_at).toBeTruthy();
  });

  it("deletes an entry", () => {
    const entry = createChangelogEntry("2.0.0", "To Delete", "");
    expect(deleteChangelogEntry(entry.id)).toBe(true);
    expect(getChangelogEntry(entry.id)).toBeNull();
  });
});
