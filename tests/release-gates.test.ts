import { describe, it, expect } from "vitest";
import { listGates, getGate, createGate, evaluateGate, deleteGate, releaseReadiness } from "../lib/release-gates";

describe("release-gates", () => {
  it("lists gates", () => {
    const all = listGates();
    expect(all.length).toBeGreaterThanOrEqual(12);
  });

  it("filters by release", () => {
    const rel1 = listGates("rel-1");
    expect(rel1.every((g) => g.release_id === "rel-1")).toBe(true);
  });

  it("filters by status", () => {
    const passed = listGates(undefined, "passed");
    expect(passed.every((g) => g.status === "passed")).toBe(true);
  });

  it("gets by id", () => {
    const g = getGate("rg-1");
    expect(g).not.toBeNull();
    expect(g!.name).toBe("Unit Tests");
  });

  it("creates gate", () => {
    const g = createGate("rel-4", "Smoke Tests", "test_pass", true);
    expect(g.status).toBe("pending");
    expect(g.required).toBe(true);
  });

  it("evaluates gate", () => {
    const g = createGate("rel-4", "Approval", "manual_approval", true);
    const evaluated = evaluateGate(g.id, "passed", "max", "Looks good");
    expect(evaluated).not.toBeNull();
    expect(evaluated!.status).toBe("passed");
    expect(evaluated!.approver).toBe("max");
    expect(evaluated!.evaluated_at).not.toBeNull();
  });

  it("calculates readiness - ready release", () => {
    const r = releaseReadiness("rel-1");
    expect(r.ready).toBe(true);
    expect(r.failed).toBe(0);
  });

  it("calculates readiness - not ready release", () => {
    const r = releaseReadiness("rel-2");
    expect(r.ready).toBe(false);
    expect(r.failed).toBeGreaterThan(0);
  });
});
