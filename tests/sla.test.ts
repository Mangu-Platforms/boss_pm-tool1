import { describe, it, expect } from "vitest";
import { getPolicies, getPolicy, calculateSla, checkSlaStatus, timeRemaining } from "@/lib/sla";

describe("SLA", () => {
  it("returns policies for all priorities", () => {
    const policies = getPolicies();
    expect(policies.length).toBe(4);
    expect(policies.find((p) => p.priority === "critical")?.response_hours).toBe(1);
  });

  it("gets policy by priority", () => {
    const policy = getPolicy("high");
    expect(policy.response_hours).toBe(4);
    expect(policy.resolution_hours).toBe(24);
  });

  it("calculates SLA deadlines", () => {
    const sla = calculateSla("critical", "2025-06-01T10:00:00Z");
    expect(sla.response_deadline).toBe("2025-06-01T11:00:00.000Z");
    expect(sla.resolution_deadline).toBe("2025-06-01T14:00:00.000Z");
  });

  it("detects breached SLA for late response", () => {
    const status = checkSlaStatus("critical", "2025-06-01T10:00:00Z", "2025-06-01T13:00:00Z", null);
    expect(status.response_breached).toBe(true);
  });

  it("detects healthy SLA for on-time response", () => {
    const status = checkSlaStatus("critical", "2025-06-01T10:00:00Z", "2025-06-01T10:30:00Z", null);
    expect(status.response_breached).toBe(false);
  });

  it("calculates time remaining", () => {
    const future = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const tr = timeRemaining(future);
    expect(tr.overdue).toBe(false);
    expect(tr.hours).toBeGreaterThanOrEqual(1);
  });

  it("detects overdue", () => {
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const tr = timeRemaining(past);
    expect(tr.overdue).toBe(true);
  });
});
