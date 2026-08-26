import { describe, it, expect } from "vitest";
import {
  listOKRs,
  getOKR,
  createOKR,
  updateKeyResult,
  updateOKRStatus,
  deleteOKR,
  okrProgress,
} from "@/lib/okrs";

describe("okrs", () => {
  it("lists seed OKRs", () => {
    const okrs = listOKRs();
    expect(okrs.length).toBeGreaterThanOrEqual(2);
  });

  it("filters by quarter", () => {
    const okrs = listOKRs("Q1 2025");
    expect(okrs.every((o) => o.quarter === "Q1 2025")).toBe(true);
  });

  it("gets OKR by id", () => {
    const okr = getOKR("okr-1");
    expect(okr).not.toBeNull();
    expect(okr!.objective).toContain("reliability");
  });

  it("creates an OKR with key results", () => {
    const okr = createOKR("Test Objective", "tester", "Q2 2025", [
      { title: "KR1", target: 100, unit: "%" },
      { title: "KR2", target: 50, unit: "items" },
    ]);
    expect(okr.key_results.length).toBe(2);
    expect(okr.status).toBe("on_track");
  });

  it("updates a key result", () => {
    const okr = createOKR("Update KR Test", "tester", "Q2 2025", [
      { title: "KR", target: 10, unit: "items" },
    ]);
    const updated = updateKeyResult(okr.id, okr.key_results[0].id, 7);
    expect(updated).not.toBeNull();
    expect(updated!.key_results[0].current).toBe(7);
  });

  it("updates OKR status", () => {
    const okr = updateOKRStatus("okr-1", "achieved");
    expect(okr).not.toBeNull();
    expect(okr!.status).toBe("achieved");
    updateOKRStatus("okr-1", "on_track");
  });

  it("calculates progress", () => {
    const progress = okrProgress("okr-1");
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it("deletes an OKR", () => {
    const okr = createOKR("Del Test", "tester", "Q3 2025", []);
    expect(deleteOKR(okr.id)).toBe(true);
    expect(deleteOKR(okr.id)).toBe(false);
  });
});
