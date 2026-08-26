import { describe, it, expect } from "vitest";
import { listAuditEntries, getAuditEntry, createAuditEntry, auditStats } from "../lib/audit-trails";

describe("audit-trails", () => {
  it("lists entries newest first", () => {
    const all = listAuditEntries();
    expect(all.length).toBeGreaterThanOrEqual(15);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].timestamp >= all[i].timestamp).toBe(true);
    }
  });

  it("filters by actor", () => {
    const max = listAuditEntries("max");
    expect(max.every((e) => e.actor === "max")).toBe(true);
  });

  it("filters by action", () => {
    const creates = listAuditEntries(undefined, "create");
    expect(creates.every((e) => e.action === "create")).toBe(true);
  });

  it("filters by resource type", () => {
    const issues = listAuditEntries(undefined, undefined, "issue");
    expect(issues.every((e) => e.resource_type === "issue")).toBe(true);
  });

  it("respects limit", () => {
    const limited = listAuditEntries(undefined, undefined, undefined, 5);
    expect(limited.length).toBe(5);
  });

  it("gets by id", () => {
    const e = getAuditEntry("at-1");
    expect(e).not.toBeNull();
    expect(e!.actor).toBe("max");
  });

  it("creates entry", () => {
    const e = createAuditEntry("max", "create", "issue", "ISS-100", "Created test issue");
    expect(e.timestamp).toBeTruthy();
  });

  it("returns stats", () => {
    const s = auditStats();
    expect(s.total).toBeGreaterThan(0);
    expect(typeof s.by_action).toBe("object");
    expect(typeof s.by_actor).toBe("object");
  });
});
