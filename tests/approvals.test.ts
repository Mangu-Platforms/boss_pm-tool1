import { describe, it, expect } from "vitest";
import { listApprovals, getApproval, requestApproval, decideApproval, deleteApproval, pendingForUser } from "@/lib/approvals";

describe("approvals", () => {
  it("lists seed approvals", () => {
    expect(listApprovals().length).toBeGreaterThanOrEqual(3);
  });

  it("filters by status", () => {
    const pending = listApprovals("pending");
    expect(pending.every((a) => a.status === "pending")).toBe(true);
  });

  it("gets approval by id", () => {
    const a = getApproval("apv-1");
    expect(a).not.toBeNull();
    expect(a!.status).toBe("approved");
  });

  it("requests an approval", () => {
    const a = requestApproval("issue", "BOSS-10", "Test approval", "max", ["alice"]);
    expect(a.status).toBe("pending");
    expect(a.approvers).toContain("alice");
  });

  it("approves a request", () => {
    const a = requestApproval("release", "rel-5", "Approve release", "max", ["alice"]);
    const decided = decideApproval(a.id, "approved", "alice", "Ship it");
    expect(decided).not.toBeNull();
    expect(decided!.status).toBe("approved");
    expect(decided!.decided_by).toBe("alice");
  });

  it("rejects non-approver", () => {
    const a = requestApproval("issue", "BOSS-11", "Test", "max", ["alice"]);
    expect(decideApproval(a.id, "approved", "bob")).toBeNull();
  });

  it("lists pending for user", () => {
    const pending = pendingForUser("max");
    expect(pending.every((a) => a.status === "pending" && a.approvers.includes("max"))).toBe(true);
  });

  it("deletes an approval", () => {
    const a = requestApproval("issue", "BOSS-12", "Del", "max", []);
    expect(deleteApproval(a.id)).toBe(true);
    expect(deleteApproval(a.id)).toBe(false);
  });
});
