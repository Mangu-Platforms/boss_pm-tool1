import { describe, it, expect } from "vitest";
import { listIncidents, getIncident, createIncident, updateIncidentStatus, addIncidentUpdate, incidentMetrics } from "../lib/incident-tracker";

describe("incident-tracker", () => {
  it("lists incidents newest first", () => {
    const all = listIncidents();
    expect(all.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].started_at >= all[i].started_at).toBe(true);
    }
  });

  it("filters by status", () => {
    const resolved = listIncidents("resolved");
    expect(resolved.every((i) => i.status === "resolved")).toBe(true);
  });

  it("gets by id", () => {
    const inc = getIncident("inc-1");
    expect(inc).not.toBeNull();
    expect(inc!.title).toBe("API latency spike");
  });

  it("creates incident with initial update", () => {
    const inc = createIncident("Test Incident", "desc", "sev-3", ["svc-1"], "max");
    expect(inc.status).toBe("detected");
    expect(inc.updates).toHaveLength(1);
  });

  it("updates incident status", () => {
    const inc = updateIncidentStatus("inc-2", "resolved");
    expect(inc).not.toBeNull();
    expect(inc!.status).toBe("resolved");
    expect(inc!.resolved_at).not.toBeNull();
  });

  it("adds update to incident", () => {
    const inc = addIncidentUpdate("inc-3", "Postmortem scheduled", "sami");
    expect(inc).not.toBeNull();
    expect(inc!.updates.length).toBeGreaterThanOrEqual(4);
  });

  it("returns metrics", () => {
    const m = incidentMetrics();
    expect(m.total).toBeGreaterThan(0);
    expect(typeof m.mttr_minutes).toBe("number");
    expect(typeof m.by_severity).toBe("object");
  });
});
