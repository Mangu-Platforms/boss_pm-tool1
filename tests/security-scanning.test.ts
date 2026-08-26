import { describe, it, expect } from "vitest";
import { listFindings, getFinding, createFinding, updateFinding, deleteFinding, securityStats } from "../lib/security-scanning";

describe("security-scanning", () => {
  it("lists findings sorted by severity", () => {
    const all = listFindings();
    expect(all.length).toBeGreaterThanOrEqual(10);
    const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    for (let i = 1; i < all.length; i++) {
      expect((sevOrder[all[i - 1].severity] ?? 5) <= (sevOrder[all[i].severity] ?? 5)).toBe(true);
    }
  });

  it("filters by scan type", () => {
    const deps = listFindings("dependency");
    expect(deps.every((f) => f.scan_type === "dependency")).toBe(true);
  });

  it("filters by severity", () => {
    const crit = listFindings(undefined, "critical");
    expect(crit.every((f) => f.severity === "critical")).toBe(true);
  });

  it("filters by status", () => {
    const open = listFindings(undefined, undefined, "open");
    expect(open.every((f) => f.status === "open")).toBe(true);
  });

  it("gets by id", () => {
    const f = getFinding("sf-1");
    expect(f).not.toBeNull();
    expect(f!.title).toBe("lodash prototype pollution");
  });

  it("creates finding", () => {
    const f = createFinding("sast", "svc-1", "New vuln", "Desc", "medium", "Fix it");
    expect(f.status).toBe("open");
    expect(f.fixed_at).toBeNull();
  });

  it("updates with fix timestamp", () => {
    const f = createFinding("dast", "svc-2", "To fix", "Desc", "low", "Patch");
    const updated = updateFinding(f.id, { status: "fixed" });
    expect(updated).not.toBeNull();
    expect(updated!.fixed_at).not.toBeNull();
  });

  it("returns stats", () => {
    const s = securityStats();
    expect(s.total).toBeGreaterThan(0);
    expect(typeof s.open).toBe("number");
    expect(typeof s.critical_open).toBe("number");
  });
});
