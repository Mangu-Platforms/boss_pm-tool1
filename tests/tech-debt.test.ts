import { describe, it, expect } from "vitest";
import { listTechDebt, getTechDebt, createTechDebt, updateTechDebt, deleteTechDebt, techDebtStats } from "../lib/tech-debt";

describe("tech-debt", () => {
  it("lists sorted by impact score", () => {
    const all = listTechDebt();
    expect(all.length).toBeGreaterThanOrEqual(8);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].impact_score >= all[i].impact_score).toBe(true);
    }
  });

  it("filters by category", () => {
    const arch = listTechDebt("architecture");
    expect(arch.every((d) => d.category === "architecture")).toBe(true);
  });

  it("filters by priority", () => {
    const high = listTechDebt(undefined, undefined, "high");
    expect(high.every((d) => d.priority === "high")).toBe(true);
  });

  it("gets by id", () => {
    const d = getTechDebt("td-1");
    expect(d).not.toBeNull();
    expect(d!.title).toBe("Monolith decomposition");
  });

  it("creates tech debt", () => {
    const d = createTechDebt("New debt", "Desc", "testing", "medium", 5, 6, "svc-1");
    expect(d.status).toBe("identified");
    expect(d.resolved_at).toBeNull();
  });

  it("updates with resolution timestamp", () => {
    const d = createTechDebt("To resolve", "Desc", "code_quality", "low", 2, 3, "svc-2");
    const updated = updateTechDebt(d.id, { status: "resolved" });
    expect(updated).not.toBeNull();
    expect(updated!.resolved_at).not.toBeNull();
  });

  it("deletes tech debt", () => {
    const d = createTechDebt("To delete", "Desc", "documentation", "low", 1, 1, "svc-1");
    expect(deleteTechDebt(d.id)).toBe(true);
    expect(getTechDebt(d.id)).toBeNull();
  });

  it("returns stats", () => {
    const s = techDebtStats();
    expect(s.total).toBeGreaterThan(0);
    expect(typeof s.unresolved).toBe("number");
    expect(typeof s.total_effort_days).toBe("number");
    expect(typeof s.avg_impact).toBe("number");
  });
});
