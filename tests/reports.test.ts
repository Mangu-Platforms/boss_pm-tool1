import { describe, it, expect } from "vitest";
import { generateReport, listReportTypes } from "@/lib/reports";

describe("reports", () => {
  it("lists report types", () => {
    const types = listReportTypes();
    expect(types.length).toBe(6);
    expect(types.find((t) => t.type === "velocity")).toBeTruthy();
  });

  it("generates velocity report", () => {
    const report = generateReport("velocity");
    expect(report.type).toBe("velocity");
    expect(report.data.sprints).toBeDefined();
  });

  it("generates throughput report", () => {
    const report = generateReport("throughput");
    expect(report.type).toBe("throughput");
    expect(report.data.total_created).toBeDefined();
  });

  it("generates time_spent report", () => {
    const report = generateReport("time_spent");
    expect(report.type).toBe("time_spent");
    expect(report.data.total_minutes).toBeDefined();
  });

  it("generates status_distribution report", () => {
    const report = generateReport("status_distribution");
    expect(report.data.distribution).toBeDefined();
    expect(report.data.total).toBeDefined();
  });

  it("generates team_load report", () => {
    const report = generateReport("team_load");
    expect(report.data.by_assignee).toBeDefined();
  });

  it("throws for unknown report type", () => {
    expect(() => generateReport("invalid" as any)).toThrow();
  });
});
