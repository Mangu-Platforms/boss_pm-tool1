import { describe, it, expect } from "vitest";
import { impactForChangeRequest, addImpactItem, removeImpactItem, impactReport, highRiskItems } from "../lib/impact-analysis";

describe("impact-analysis", () => {
  it("lists impact items for a change request sorted by severity", () => {
    const items = impactForChangeRequest("cr-1");
    expect(items.length).toBe(2);
    expect(items[0].severity).toBe("high");
  });

  it("adds impact item", () => {
    const item = addImpactItem("cr-4", "cost", "low", "Minor cost increase", "Budget buffer", 0, 2);
    expect(item.change_request_id).toBe("cr-4");
    expect(item.area).toBe("cost");
  });

  it("removes impact item", () => {
    const item = addImpactItem("cr-4", "reliability", "medium", "test", "test", 0, 0);
    expect(removeImpactItem(item.id)).toBe(true);
    expect(removeImpactItem(item.id)).toBe(false);
  });

  it("generates impact report", () => {
    const report = impactReport("cr-1");
    expect(report.change_request_id).toBe("cr-1");
    expect(report.overall_severity).toBe("high");
    expect(report.total_effort_hours).toBeGreaterThan(0);
    expect(report.areas_impacted.length).toBeGreaterThan(0);
  });

  it("returns high risk items", () => {
    const highs = highRiskItems();
    expect(highs.every((i) => i.severity === "high" || i.severity === "critical")).toBe(true);
  });

  it("returns empty for unknown CR", () => {
    const items = impactForChangeRequest("nonexistent");
    expect(items).toHaveLength(0);
  });
});
