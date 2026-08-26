import { describe, it, expect } from "vitest";
import { listEndpoints, getEndpoint, createEndpoint, recordCheck, endpointChecks, deleteEndpoint, apiHealthSummary } from "../lib/api-health";

describe("api-health", () => {
  it("lists endpoints sorted by uptime ascending", () => {
    const all = listEndpoints();
    expect(all.length).toBeGreaterThanOrEqual(10);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].uptime_pct <= all[i].uptime_pct).toBe(true);
    }
  });

  it("filters by service", () => {
    const svc1 = listEndpoints("svc-1");
    expect(svc1.every((e) => e.service_id === "svc-1")).toBe(true);
  });

  it("filters by status", () => {
    const healthy = listEndpoints(undefined, "healthy");
    expect(healthy.every((e) => e.status === "healthy")).toBe(true);
  });

  it("gets by id", () => {
    const ep = getEndpoint("ep-1");
    expect(ep).not.toBeNull();
    expect(ep!.path).toBe("/api/users");
  });

  it("creates endpoint", () => {
    const ep = createEndpoint("svc-test", "GET", "/api/test");
    expect(ep.status).toBe("unknown");
    expect(ep.response_time_ms).toBe(0);
  });

  it("records health check and updates endpoint", () => {
    const ep = createEndpoint("svc-check", "POST", "/api/check");
    const check = recordCheck(ep.id, 200, 100);
    expect(check).not.toBeNull();
    expect(check!.status).toBe("healthy");
    const updated = getEndpoint(ep.id);
    expect(updated!.status).toBe("healthy");
    expect(updated!.response_time_ms).toBe(100);
  });

  it("marks degraded for slow response", () => {
    const ep = createEndpoint("svc-slow", "GET", "/api/slow");
    recordCheck(ep.id, 200, 800);
    expect(getEndpoint(ep.id)!.status).toBe("degraded");
  });

  it("returns check history", () => {
    const history = endpointChecks("ep-1");
    expect(history.length).toBeGreaterThanOrEqual(2);
  });

  it("returns summary", () => {
    const s = apiHealthSummary();
    expect(s.total).toBeGreaterThan(0);
    expect(typeof s.avg_response_ms).toBe("number");
    expect(typeof s.avg_uptime).toBe("number");
  });
});
