import { describe, it, expect } from "vitest";
import { listRelations, getRelation, addRelation, removeRelation, childIssues, parentIssue, duplicates } from "../lib/issue-relations";

describe("issue-relations", () => {
  it("lists all relations", () => {
    const all = listRelations();
    expect(all.length).toBeGreaterThanOrEqual(3);
  });

  it("filters by issue id", () => {
    const rels = listRelations("ISS-1");
    expect(rels.length).toBeGreaterThan(0);
    expect(rels.every((r) => r.source_issue_id === "ISS-1" || r.target_issue_id === "ISS-1")).toBe(true);
  });

  it("adds relation", () => {
    const r = addRelation("ISS-10", "ISS-11", "related");
    expect(r).not.toBeNull();
    expect(r!.type).toBe("related");
  });

  it("rejects self-relation", () => {
    expect(addRelation("ISS-1", "ISS-1", "related")).toBeNull();
  });

  it("prevents duplicate", () => {
    const r1 = addRelation("ISS-20", "ISS-21", "related");
    const r2 = addRelation("ISS-20", "ISS-21", "related");
    expect(r1!.id).toBe(r2!.id);
  });

  it("finds child issues", () => {
    const children = childIssues("ISS-1");
    expect(children).toContain("ISS-3");
  });

  it("finds parent issue", () => {
    const parent = parentIssue("ISS-3");
    expect(parent).toBe("ISS-1");
  });

  it("removes relation", () => {
    const r = addRelation("ISS-30", "ISS-31", "duplicate");
    expect(removeRelation(r!.id)).toBe(true);
  });
});
