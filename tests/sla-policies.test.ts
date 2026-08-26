import { describe, it, expect } from "vitest";
import { listPolicies, getPolicy, createPolicy, updatePolicy, deletePolicy, listBreaches, recordBreach, policyForPriority } from "@/lib/sla-policies";

describe("sla-policies", () => {
  it("lists seed policies", () => {
    expect(listPolicies().length).toBeGreaterThanOrEqual(4);
  });

  it("gets policy by id", () => {
    const p = getPolicy("slap-1");
    expect(p).not.toBeNull();
    expect(p!.name).toContain("Critical");
  });

  it("creates a policy", () => {
    const p = createPolicy("Custom SLA", "high", 2, 12);
    expect(p.response_hours).toBe(2);
    expect(p.active).toBe(true);
  });

  it("updates a policy", () => {
    const p = createPolicy("Update Test", "medium", 8, 48);
    const updated = updatePolicy(p.id, { active: false, response_hours: 4 });
    expect(updated!.active).toBe(false);
    expect(updated!.response_hours).toBe(4);
  });

  it("deletes a policy", () => {
    const p = createPolicy("Del Test", "low", 24, 120);
    expect(deletePolicy(p.id)).toBe(true);
    expect(deletePolicy(p.id)).toBe(false);
  });

  it("lists breaches", () => {
    expect(listBreaches().length).toBeGreaterThanOrEqual(2);
  });

  it("records a breach", () => {
    const b = recordBreach("slap-1", "BOSS-10", "response");
    expect(b.breach_type).toBe("response");
  });

  it("finds policy for priority", () => {
    const p = policyForPriority("critical");
    expect(p).not.toBeNull();
    expect(p!.priority).toBe("critical");
  });
});
