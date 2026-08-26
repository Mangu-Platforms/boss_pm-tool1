import { describe, it, expect, beforeEach } from "vitest";
import { addRelation, listRelations, removeRelation } from "@/lib/relations";

describe("relations", () => {
  beforeEach(() => {
    const rels = listRelations("test-a");
    rels.forEach((r) => removeRelation(r.id));
    const rels2 = listRelations("test-b");
    rels2.forEach((r) => removeRelation(r.id));
  });

  it("adds a relation between two issues", () => {
    const rel = addRelation("test-a", "test-b", "blocks");
    expect(rel.from_issue_id).toBe("test-a");
    expect(rel.to_issue_id).toBe("test-b");
    expect(rel.relation_type).toBe("blocks");
    expect(rel.id).toBeTruthy();
    removeRelation(rel.id);
  });

  it("prevents self-relation", () => {
    expect(() => addRelation("test-a", "test-a", "blocks")).toThrow("cannot relate issue to itself");
  });

  it("returns existing relation on duplicate", () => {
    const r1 = addRelation("test-a", "test-b", "relates-to");
    const r2 = addRelation("test-a", "test-b", "relates-to");
    expect(r1.id).toBe(r2.id);
    removeRelation(r1.id);
  });

  it("lists relations for an issue", () => {
    const r1 = addRelation("test-a", "test-b", "blocks");
    const r2 = addRelation("test-b", "test-a", "duplicates");
    const list = listRelations("test-a");
    expect(list.length).toBe(2);
    removeRelation(r1.id);
    removeRelation(r2.id);
  });

  it("removes a relation", () => {
    const rel = addRelation("test-a", "test-b", "blocked-by");
    expect(removeRelation(rel.id)).toBe(true);
    expect(removeRelation(rel.id)).toBe(false);
  });

  it("allows different relation types between same issues", () => {
    const r1 = addRelation("test-a", "test-b", "blocks");
    const r2 = addRelation("test-a", "test-b", "relates-to");
    expect(r1.id).not.toBe(r2.id);
    removeRelation(r1.id);
    removeRelation(r2.id);
  });
});
