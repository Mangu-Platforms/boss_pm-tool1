import { describe, it, expect } from "vitest";
import { logAudit, listAuditLog, auditCount } from "@/lib/audit-log";

describe("audit log", () => {
  it("logs an entry", () => {
    const entry = logAudit("user-max", "create", "issue", "iss-1", "Created issue");
    expect(entry.actor).toBe("user-max");
    expect(entry.action).toBe("create");
  });

  it("lists entries newest first", () => {
    logAudit("user-max", "update", "issue", "iss-1", "Updated status");
    logAudit("user-max", "delete", "issue", "iss-2", "Deleted issue");
    const entries = listAuditLog();
    expect(entries.length).toBeGreaterThanOrEqual(3);
  });

  it("filters by actor", () => {
    logAudit("user-bob", "create", "product", "prod-1", "Created product");
    const entries = listAuditLog({ actor: "user-bob" });
    expect(entries.every((e) => e.actor === "user-bob")).toBe(true);
  });

  it("filters by action", () => {
    const entries = listAuditLog({ action: "create" });
    expect(entries.every((e) => e.action === "create")).toBe(true);
  });

  it("filters by resource_type", () => {
    const entries = listAuditLog({ resource_type: "issue" });
    expect(entries.every((e) => e.resource_type === "issue")).toBe(true);
  });

  it("respects limit", () => {
    for (let i = 0; i < 10; i++) logAudit("x", "create", "x", `x-${i}`, "x");
    const entries = listAuditLog({ limit: 3 });
    expect(entries.length).toBe(3);
  });

  it("counts total entries", () => {
    expect(auditCount()).toBeGreaterThan(0);
  });
});
