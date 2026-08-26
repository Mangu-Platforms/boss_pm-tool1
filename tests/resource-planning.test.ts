import { describe, it, expect } from "vitest";
import { listAllocations, getAllocation, createAllocation, updateAllocation, deleteAllocation, memberUtilization, overAllocatedMembers } from "../lib/resource-planning";

describe("resource-planning", () => {
  it("lists all allocations", () => {
    const all = listAllocations();
    expect(all.length).toBeGreaterThanOrEqual(4);
  });

  it("filters by member", () => {
    const maxAllocs = listAllocations("max");
    expect(maxAllocs.every((a) => a.member === "max")).toBe(true);
  });

  it("filters by project", () => {
    const allocs = listAllocations(undefined, "boss-wallet");
    expect(allocs.every((a) => a.project_id === "boss-wallet")).toBe(true);
  });

  it("gets allocation by id", () => {
    const a = getAllocation("ra-1");
    expect(a).not.toBeNull();
    expect(a!.member).toBe("max");
  });

  it("creates allocation", () => {
    const a = createAllocation("carol", "boss-pm", 30, "2025-05-01", "2025-08-31", "Part-time");
    expect(a.member).toBe("carol");
    expect(a.allocation_pct).toBe(30);
  });

  it("updates allocation", () => {
    const a = updateAllocation("ra-1", { allocation_pct: 70 });
    expect(a).not.toBeNull();
    expect(a!.allocation_pct).toBe(70);
  });

  it("calculates member utilization", () => {
    const util = memberUtilization("max");
    expect(util).toBeGreaterThan(0);
  });

  it("detects over-allocated members", () => {
    const over = overAllocatedMembers();
    expect(Array.isArray(over)).toBe(true);
  });

  it("deletes allocation", () => {
    const a = createAllocation("temp", "test", 10, "2025-01-01", "2025-12-31");
    expect(deleteAllocation(a.id)).toBe(true);
    expect(getAllocation(a.id)).toBeNull();
  });
});
