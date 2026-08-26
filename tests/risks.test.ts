import { describe, it, expect } from "vitest";
import { listRisks, getRisk, createRisk, updateRisk, deleteRisk, riskScore, riskMatrix } from "@/lib/risks";

describe("risks", () => {
  it("lists default risks sorted by score", () => {
    const risks = listRisks();
    expect(risks.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < risks.length; i++) {
      expect(riskScore(risks[i - 1])).toBeGreaterThanOrEqual(riskScore(risks[i]));
    }
  });

  it("gets risk by id", () => {
    const risk = getRisk("risk-vendor");
    expect(risk).toBeTruthy();
    expect(risk!.title).toBe("Vendor lock-in");
  });

  it("creates a risk", () => {
    const risk = createRisk("New Risk", "description", "high", "medium");
    expect(risk.status).toBe("open");
    expect(risk.likelihood).toBe("high");
    expect(risk.impact).toBe("medium");
  });

  it("updates a risk", () => {
    const risk = createRisk("Update Me", "", "low", "low");
    const updated = updateRisk(risk.id, { status: "mitigated", mitigation: "Fixed it" });
    expect(updated!.status).toBe("mitigated");
    expect(updated!.mitigation).toBe("Fixed it");
  });

  it("deletes a risk", () => {
    const risk = createRisk("Delete Me", "", "low", "low");
    expect(deleteRisk(risk.id)).toBe(true);
    expect(getRisk(risk.id)).toBeNull();
  });

  it("calculates risk score", () => {
    const risk = createRisk("Score Test", "", "high", "critical");
    expect(riskScore(risk)).toBe(12);
  });

  it("returns risk matrix", () => {
    const matrix = riskMatrix();
    expect(matrix.length).toBe(4);
    const levels = matrix.map((m) => m.level);
    expect(levels).toContain("critical");
    expect(levels).toContain("high");
    expect(levels).toContain("medium");
    expect(levels).toContain("low");
  });
});
