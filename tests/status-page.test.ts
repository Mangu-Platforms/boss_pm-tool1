import { describe, it, expect } from "vitest";
import {
  listServices,
  getService,
  updateServiceStatus,
  listIncidents,
  createIncident,
  addIncidentUpdate,
  resolveIncident,
  overallStatus,
} from "@/lib/status-page";

describe("status-page", () => {
  it("lists seed services", () => {
    const svcs = listServices();
    expect(svcs.length).toBeGreaterThanOrEqual(5);
    expect(svcs.find((s) => s.id === "svc-api")).toBeTruthy();
  });

  it("gets a service by id", () => {
    const svc = getService("svc-web");
    expect(svc).not.toBeNull();
    expect(svc!.name).toBe("Web App");
  });

  it("returns null for unknown service", () => {
    expect(getService("svc-nope")).toBeNull();
  });

  it("updates service status", () => {
    const svc = updateServiceStatus("svc-cdn", "maintenance");
    expect(svc).not.toBeNull();
    expect(svc!.status).toBe("maintenance");
    updateServiceStatus("svc-cdn", "operational");
  });

  it("lists incidents", () => {
    const incs = listIncidents();
    expect(incs.length).toBeGreaterThanOrEqual(1);
  });

  it("creates an incident", () => {
    const inc = createIncident("Test outage", "svc-api", "major");
    expect(inc.title).toBe("Test outage");
    expect(inc.severity).toBe("major");
    expect(inc.status).toBe("investigating");
    expect(inc.updates.length).toBe(1);
  });

  it("adds update to incident", () => {
    const incs = listIncidents();
    const target = incs[0];
    const before = target.updates.length;
    const updated = addIncidentUpdate(target.id, "Scaling up");
    expect(updated).not.toBeNull();
    expect(updated!.updates.length).toBe(before + 1);
  });

  it("resolves an incident", () => {
    const inc = createIncident("Resolve test", "svc-db", "minor");
    const resolved = resolveIncident(inc.id);
    expect(resolved).not.toBeNull();
    expect(resolved!.status).toBe("resolved");
    expect(resolved!.resolved_at).not.toBeNull();
  });

  it("computes overall status", () => {
    const status = overallStatus();
    expect(["operational", "degraded", "partial_outage", "major_outage", "maintenance"]).toContain(status);
  });
});
