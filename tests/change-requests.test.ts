import { describe, it, expect } from "vitest";
import { listChangeRequests, getChangeRequest, createChangeRequest, updateChangeRequest, deleteChangeRequest, changeRequestStats } from "../lib/change-requests";

describe("change-requests", () => {
  it("lists all change requests newest first", () => {
    const all = listChangeRequests();
    expect(all.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].submitted_at >= all[i].submitted_at).toBe(true);
    }
  });

  it("filters by status", () => {
    const approved = listChangeRequests("approved");
    expect(approved.every((cr) => cr.status === "approved")).toBe(true);
  });

  it("gets by id", () => {
    const cr = getChangeRequest("cr-1");
    expect(cr).not.toBeNull();
    expect(cr!.title).toBe("Migrate DB to PostgreSQL 16");
  });

  it("creates change request", () => {
    const cr = createChangeRequest("Test CR", "desc", "feature", "medium", "max", ["api"], "low", "revert");
    expect(cr.status).toBe("draft");
    expect(cr.affected_systems).toContain("api");
  });

  it("updates status with review timestamp", () => {
    const cr = updateChangeRequest("cr-3", { status: "approved" });
    expect(cr).not.toBeNull();
    expect(cr!.status).toBe("approved");
    expect(cr!.reviewed_at).not.toBeNull();
  });

  it("deletes change request", () => {
    const cr = createChangeRequest("ToDelete", "d", "bugfix", "low", "max", [], "low", "");
    expect(deleteChangeRequest(cr.id)).toBe(true);
    expect(getChangeRequest(cr.id)).toBeNull();
  });

  it("returns stats", () => {
    const stats = changeRequestStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(typeof stats.pending).toBe("number");
  });
});
