import { describe, it, expect } from "vitest";
import { listUtilization, getUtilization, recordUtilization, utilizationSummary, memberWorkload } from "../lib/resource-utilization";

describe("resource-utilization", () => {
  it("lists all entries", () => {
    const all = listUtilization();
    expect(all.length).toBeGreaterThanOrEqual(6);
  });

  it("filters by member", () => {
    const maxEntries = listUtilization("max");
    expect(maxEntries.every((e) => e.member === "max")).toBe(true);
  });

  it("filters by period", () => {
    const weekly = listUtilization(undefined, "weekly");
    expect(weekly.every((e) => e.period === "weekly")).toBe(true);
  });

  it("gets by id", () => {
    const entry = getUtilization("ru-1");
    expect(entry).not.toBeNull();
    expect(entry!.member).toBe("max");
  });

  it("records new entry with calculated utilization", () => {
    const entry = recordUtilization("alex", "weekly", "2025-08-25", 40, 30, 28);
    expect(entry.utilization_pct).toBe(70);
    expect(entry.member).toBe("alex");
  });

  it("returns utilization summary", () => {
    const summary = utilizationSummary();
    expect(summary.total_members).toBeGreaterThan(0);
    expect(summary.avg_utilization).toBeGreaterThan(0);
    expect(typeof summary.over_utilized).toBe("number");
    expect(typeof summary.under_utilized).toBe("number");
  });

  it("returns member workload", () => {
    const wl = memberWorkload("max");
    expect(typeof wl.active_issues).toBe("number");
    expect(typeof wl.total_issues).toBe("number");
  });
});
