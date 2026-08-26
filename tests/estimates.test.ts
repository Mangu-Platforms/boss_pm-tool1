import { describe, it, expect } from "vitest";
import {
  listEstimates,
  getEstimate,
  createEstimate,
  updateEstimate,
  deleteEstimate,
  totalEstimate,
  averageEstimate,
} from "@/lib/estimates";

describe("estimates", () => {
  it("lists seed estimates", () => {
    const ests = listEstimates();
    expect(ests.length).toBeGreaterThanOrEqual(4);
  });

  it("filters by issue_id", () => {
    const ests = listEstimates("BOSS-1");
    expect(ests.every((e) => e.issue_id === "BOSS-1")).toBe(true);
  });

  it("gets estimate by id", () => {
    const est = getEstimate("est-1");
    expect(est).not.toBeNull();
    expect(est!.value).toBe(5);
  });

  it("creates an estimate", () => {
    const est = createEstimate("BOSS-99", 13, "points", "tester");
    expect(est.value).toBe(13);
    expect(est.unit).toBe("points");
  });

  it("updates an estimate", () => {
    const est = createEstimate("BOSS-98", 5, "hours", "tester");
    const updated = updateEstimate(est.id, 8);
    expect(updated).not.toBeNull();
    expect(updated!.value).toBe(8);
  });

  it("deletes an estimate", () => {
    const est = createEstimate("BOSS-97", 1, "days", "tester");
    expect(deleteEstimate(est.id)).toBe(true);
    expect(deleteEstimate(est.id)).toBe(false);
  });

  it("calculates total", () => {
    expect(totalEstimate("points")).toBeGreaterThan(0);
  });

  it("calculates average", () => {
    expect(averageEstimate("points")).toBeGreaterThan(0);
  });
});
