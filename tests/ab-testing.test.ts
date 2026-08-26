import { describe, it, expect } from "vitest";
import { listExperiments, getExperiment, createExperiment, updateExperiment, recordImpression, experimentResults, deleteExperiment } from "../lib/ab-testing";

describe("ab-testing", () => {
  it("lists experiments newest first", () => {
    const all = listExperiments();
    expect(all.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].created_at >= all[i].created_at).toBe(true);
    }
  });

  it("filters by status", () => {
    const running = listExperiments("running");
    expect(running.every((e) => e.status === "running")).toBe(true);
  });

  it("gets by id", () => {
    const exp = getExperiment("exp-1");
    expect(exp).not.toBeNull();
    expect(exp!.name).toBe("CTA Button Color");
  });

  it("creates experiment with two variants", () => {
    const exp = createExperiment("Test Exp", "hypothesis", "clicks", "max");
    expect(exp.status).toBe("draft");
    expect(exp.variants).toHaveLength(2);
  });

  it("updates experiment status", () => {
    const exp = updateExperiment("exp-3", { status: "running" });
    expect(exp).not.toBeNull();
    expect(exp!.start_date).not.toBeNull();
  });

  it("records impression", () => {
    const exp = recordImpression("exp-1", "v-1", true);
    expect(exp).not.toBeNull();
    expect(exp!.variants[0].conversions).toBeGreaterThan(120);
  });

  it("calculates experiment results", () => {
    const r = experimentResults("exp-1");
    expect(r).not.toBeNull();
    expect(typeof r!.lift).toBe("number");
    expect(r!.significant).toBe(true);
  });

  it("deletes experiment", () => {
    const exp = createExperiment("ToDel", "h", "m", "max");
    expect(deleteExperiment(exp.id)).toBe(true);
    expect(getExperiment(exp.id)).toBeNull();
  });
});
