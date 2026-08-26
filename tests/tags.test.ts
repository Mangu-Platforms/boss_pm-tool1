import { describe, it, expect } from "vitest";
import { listTags, getTag, createTag, updateTag, deleteTag, addTagToIssue, removeTagFromIssue, tagsForIssue, issuesForTag } from "@/lib/tags";

describe("tags", () => {
  it("lists default tags", () => {
    const tags = listTags();
    expect(tags.length).toBeGreaterThanOrEqual(6);
    expect(tags.find((t) => t.name === "bug")).toBeTruthy();
  });

  it("gets tag by id", () => {
    expect(getTag("tag-bug")).toBeTruthy();
    expect(getTag("tag-bug")!.name).toBe("bug");
  });

  it("returns null for unknown tag", () => {
    expect(getTag("nope")).toBeNull();
  });

  it("creates a tag", () => {
    const tag = createTag("urgent", "#ff0000", "Very urgent");
    expect(tag.name).toBe("urgent");
    expect(tag.color).toBe("#ff0000");
  });

  it("rejects duplicate tag names", () => {
    expect(() => createTag("bug", "#000")).toThrow("already exists");
  });

  it("updates a tag", () => {
    const tag = createTag("temp-update", "#333");
    const updated = updateTag(tag.id, { name: "updated-tag", color: "#fff" });
    expect(updated!.name).toBe("updated-tag");
  });

  it("deletes a tag", () => {
    const tag = createTag("to-delete", "#000");
    expect(deleteTag(tag.id)).toBe(true);
    expect(getTag(tag.id)).toBeNull();
  });

  it("adds and removes tags from issues", () => {
    addTagToIssue("test-issue-1", "tag-bug");
    addTagToIssue("test-issue-1", "tag-feature");
    addTagToIssue("test-issue-1", "tag-bug"); // duplicate
    expect(tagsForIssue("test-issue-1").length).toBe(2);
    expect(issuesForTag("tag-bug")).toContain("test-issue-1");

    removeTagFromIssue("test-issue-1", "tag-bug");
    expect(tagsForIssue("test-issue-1").length).toBe(1);
  });
});
