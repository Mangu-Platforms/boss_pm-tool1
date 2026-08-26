import { describe, it, expect } from "vitest";
import { listPolicies, getPolicy, createPolicy, updatePolicy, recordCleanup, deletePolicy, retentionSummary } from "../lib/data-retention";

describe("data-retention", () => {
  it("lists policies sorted by next cleanup", () => {
    const all = listPolicies();
    expect(all.length).toBeGreaterThanOrEqual(8);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].next_cleanup <= all[i].next_cleanup).toBe(true);
    }
  });

  it("filters by category", () => {
    const analytics = listPolicies("analytics");
    expect(analytics.every((p) => p.category === "analytics")).toBe(true);
  });

  it("filters by status", () => {
    const active = listPolicies(undefined, "active");
    expect(active.every((p) => p.status === "active")).toBe(true);
  });

  it("gets by id", () => {
    const p = getPolicy("rp-1");
    expect(p).not.toBeNull();
    expect(p!.category).toBe("audit_logs");
  });

  it("creates policy", () => {
    const p = createPolicy("Test Policy", "temp_files", 14, true, "Test cleanup");
    expect(p.status).toBe("active");
    expect(p.records_affected).toBe(0);
  });

  it("records cleanup", () => {
    const p = createPolicy("Cleanup Test", "session_data", 30, true, "Test");
    updatePolicy(p.id, { records_affected: 1000, storage_bytes: 1048576 });
    const cleaned = recordCleanup(p.id, 500, 524288);
    expect(cleaned).not.toBeNull();
    expect(cleaned!.records_affected).toBe(500);
    expect(cleaned!.last_cleanup).not.toBeNull();
  });

  it("deletes policy", () => {
    const p = createPolicy("To delete", "backups", 7, false, "Test");
    expect(deletePolicy(p.id)).toBe(true);
    expect(getPolicy(p.id)).toBeNull();
  });

  it("returns summary", () => {
    const s = retentionSummary();
    expect(s.total).toBeGreaterThan(0);
    expect(typeof s.total_storage_gb).toBe("number");
    expect(typeof s.auto_delete_count).toBe("number");
  });
});
