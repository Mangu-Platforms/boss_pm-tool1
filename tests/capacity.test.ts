import { describe, it, expect } from "vitest";
import { listAllocations, getAllocationsForMember, createAllocation, updateAllocation, deleteAllocation, getCapacitySummary, isOverallocated } from "@/lib/capacity";

describe("capacity", () => {
  it("lists default allocations", () => {
    const allocs = listAllocations();
    expect(allocs.length).toBeGreaterThanOrEqual(5);
  });

  it("gets allocations for member", () => {
    const allocs = getAllocationsForMember("Max");
    expect(allocs.length).toBeGreaterThanOrEqual(2);
  });

  it("creates an allocation", () => {
    const alloc = createAllocation("Eve", "Boss PM", 50, "2025-04-01");
    expect(alloc.member).toBe("Eve");
    expect(alloc.percentage).toBe(50);
  });

  it("clamps percentage to 0-100", () => {
    const alloc = createAllocation("Test", "X", 150, "2025-01-01");
    expect(alloc.percentage).toBe(100);
  });

  it("updates an allocation", () => {
    const alloc = createAllocation("Update Test", "Y", 30, "2025-01-01");
    const updated = updateAllocation(alloc.id, { percentage: 60 });
    expect(updated!.percentage).toBe(60);
  });

  it("deletes an allocation", () => {
    const alloc = createAllocation("Delete Test", "Z", 20, "2025-01-01");
    expect(deleteAllocation(alloc.id)).toBe(true);
  });

  it("returns capacity summary", () => {
    const summary = getCapacitySummary();
    expect(summary.length).toBeGreaterThan(0);
    for (const entry of summary) {
      expect(entry.total_hours).toBe(40);
      expect(entry.allocated_hours + entry.available_hours).toBe(40);
    }
  });

  it("detects over-allocation", () => {
    createAllocation("Overworked", "A", 60, "2025-01-01");
    createAllocation("Overworked", "B", 50, "2025-01-01");
    expect(isOverallocated("Overworked")).toBe(true);
  });
});
