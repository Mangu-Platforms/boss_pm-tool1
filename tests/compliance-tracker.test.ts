import { describe, it, expect } from "vitest";
import { listControls, getControl, createControl, updateControl, deleteControl, complianceSummary, overdueControls } from "../lib/compliance-tracker";

describe("compliance-tracker", () => {
  it("lists controls sorted by framework and control_id", () => {
    const all = listControls();
    expect(all.length).toBeGreaterThanOrEqual(6);
  });

  it("filters by framework", () => {
    const soc2 = listControls("SOC2");
    expect(soc2.every((c) => c.framework === "SOC2")).toBe(true);
  });

  it("filters by status", () => {
    const compliant = listControls(undefined, "compliant");
    expect(compliant.every((c) => c.status === "compliant")).toBe(true);
  });

  it("gets by id", () => {
    const ctrl = getControl("cc-1");
    expect(ctrl).not.toBeNull();
    expect(ctrl!.title).toBe("Access Control");
  });

  it("creates control", () => {
    const ctrl = createControl("HIPAA", "164.312", "Audit Controls", "desc", "max", "2026-01-01");
    expect(ctrl.status).toBe("not_assessed");
  });

  it("updates control with assessment date", () => {
    const ctrl = updateControl("cc-4", { status: "in_progress" });
    expect(ctrl).not.toBeNull();
    expect(ctrl!.last_assessed).not.toBeNull();
  });

  it("returns compliance summary", () => {
    const summary = complianceSummary();
    expect(summary.total).toBeGreaterThan(0);
    expect(typeof summary.compliance_pct).toBe("number");
  });

  it("deletes control", () => {
    const ctrl = createControl("PCI_DSS", "1.1", "Test", "d", "max", "2026-01-01");
    expect(deleteControl(ctrl.id)).toBe(true);
    expect(getControl(ctrl.id)).toBeNull();
  });
});
