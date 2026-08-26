import { describe, it, expect } from "vitest";
import { listReleases, getRelease, createRelease, updateRelease, publishRelease, deleteRelease, addIssueToRelease, removeIssueFromRelease } from "@/lib/releases";

describe("releases", () => {
  it("lists defaults", () => {
    const rels = listReleases();
    expect(rels.length).toBeGreaterThanOrEqual(1);
    expect(rels.find((r) => r.version === "0.1.0")).toBeTruthy();
  });

  it("gets release by id", () => {
    expect(getRelease("rel-0.1")).toBeTruthy();
  });

  it("returns null for unknown", () => {
    expect(getRelease("nope")).toBeNull();
  });

  it("creates a draft release", () => {
    const rel = createRelease("1.0.0", "GA Launch", "Major release", ["iss-1"]);
    expect(rel.published).toBe(false);
    expect(rel.issue_ids).toContain("iss-1");
  });

  it("publishes a release", () => {
    const rel = createRelease("1.1.0", "Patch", "fixes");
    const published = publishRelease(rel.id);
    expect(published!.published).toBe(true);
    expect(published!.published_at).toBeTruthy();
  });

  it("updates a release", () => {
    const rel = createRelease("2.0.0", "Old", "");
    const updated = updateRelease(rel.id, { title: "New Title", notes: "Updated notes" });
    expect(updated!.title).toBe("New Title");
    expect(updated!.notes).toBe("Updated notes");
  });

  it("deletes a release", () => {
    const rel = createRelease("3.0.0", "To Delete", "");
    expect(deleteRelease(rel.id)).toBe(true);
    expect(getRelease(rel.id)).toBeNull();
  });

  it("adds issue to release", () => {
    const rel = createRelease("4.0.0", "Issues", "");
    addIssueToRelease(rel.id, "iss-a");
    addIssueToRelease(rel.id, "iss-b");
    addIssueToRelease(rel.id, "iss-a"); // duplicate
    const fetched = getRelease(rel.id);
    expect(fetched!.issue_ids.length).toBe(2);
  });

  it("removes issue from release", () => {
    const rel = createRelease("5.0.0", "Remove", "");
    addIssueToRelease(rel.id, "iss-x");
    removeIssueFromRelease(rel.id, "iss-x");
    expect(getRelease(rel.id)!.issue_ids).not.toContain("iss-x");
  });
});
