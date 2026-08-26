import { describe, it, expect } from "vitest";
import { listReleaseNotes, getReleaseNote, createReleaseNote, updateReleaseNote, publishReleaseNote, deleteReleaseNote } from "@/lib/release-notes";

describe("release-notes", () => {
  it("lists seed notes", () => {
    expect(listReleaseNotes().length).toBeGreaterThanOrEqual(3);
  });

  it("filters by version", () => {
    const notes = listReleaseNotes("1.0.0");
    expect(notes.every((n) => n.version === "1.0.0")).toBe(true);
  });

  it("gets note by id", () => {
    const n = getReleaseNote("rn-1");
    expect(n).not.toBeNull();
    expect(n!.title).toContain("Initial");
  });

  it("creates a note", () => {
    const n = createReleaseNote("2.0.0", "Major Update", "Big changes", "feature");
    expect(n.published).toBe(false);
  });

  it("publishes a note", () => {
    const n = createReleaseNote("2.1.0", "Pub Test", "", "bugfix");
    const pub = publishReleaseNote(n.id);
    expect(pub!.published).toBe(true);
  });

  it("updates a note", () => {
    const n = createReleaseNote("2.2.0", "Up Test", "", "feature");
    const updated = updateReleaseNote(n.id, { title: "Updated", category: "improvement" });
    expect(updated!.title).toBe("Updated");
    expect(updated!.category).toBe("improvement");
  });

  it("deletes a note", () => {
    const n = createReleaseNote("9.9.9", "Del Test", "", "feature");
    expect(deleteReleaseNote(n.id)).toBe(true);
    expect(deleteReleaseNote(n.id)).toBe(false);
  });
});
