import { describe, it, expect } from "vitest";
import { cloneIssue, bulkClone } from "../lib/issue-cloning";
import { listIssues } from "../lib/store";

describe("issue-cloning", () => {
  it("clones an existing issue", () => {
    const issues = listIssues();
    const original = issues[0];
    const result = cloneIssue(original.id);
    expect(result).not.toBeNull();
    expect(result!.title).toContain("[Clone]");
    expect(result!.original_id).toBe(original.id);
  });

  it("returns null for nonexistent issue", () => {
    expect(cloneIssue("nonexistent-999")).toBeNull();
  });

  it("uses custom prefix", () => {
    const issues = listIssues();
    const result = cloneIssue(issues[0].id, { prefix: "[Copy]" });
    expect(result).not.toBeNull();
    expect(result!.title).toContain("[Copy]");
  });

  it("bulk clones multiple issues", () => {
    const issues = listIssues();
    const ids = issues.slice(0, 2).map((i) => i.id);
    const results = bulkClone(ids);
    expect(results).toHaveLength(2);
  });

  it("skips invalid ids in bulk clone", () => {
    const issues = listIssues();
    const results = bulkClone([issues[0].id, "invalid-999"]);
    expect(results).toHaveLength(1);
  });
});
