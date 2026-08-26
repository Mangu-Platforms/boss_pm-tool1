import { describe, it, expect } from "vitest";
import { listDeployments, getDeployment, createDeployment, updateDeployment, deploymentMetrics } from "../lib/deployment-tracking";

describe("deployment-tracking", () => {
  it("lists deployments newest first", () => {
    const all = listDeployments();
    expect(all.length).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].started_at >= all[i].started_at).toBe(true);
    }
  });

  it("filters by service", () => {
    const svc1 = listDeployments("svc-1");
    expect(svc1.every((d) => d.service_id === "svc-1")).toBe(true);
  });

  it("filters by environment", () => {
    const prod = listDeployments(undefined, "production");
    expect(prod.every((d) => d.environment === "production")).toBe(true);
  });

  it("gets by id", () => {
    const dep = getDeployment("dep-1");
    expect(dep).not.toBeNull();
    expect(dep!.version).toBe("2.3.1");
  });

  it("creates deployment", () => {
    const dep = createDeployment("svc-2", "1.9.0", "production", "max", "xyz999");
    expect(dep.status).toBe("pending");
    expect(dep.duration_seconds).toBeNull();
  });

  it("updates deployment with completion", () => {
    const dep = createDeployment("svc-1", "2.4.0", "staging", "sami", "abc123");
    const updated = updateDeployment(dep.id, { status: "success" });
    expect(updated).not.toBeNull();
    expect(updated!.completed_at).not.toBeNull();
    expect(updated!.duration_seconds).not.toBeNull();
  });

  it("returns metrics", () => {
    const m = deploymentMetrics();
    expect(m.total).toBeGreaterThan(0);
    expect(typeof m.success_rate).toBe("number");
    expect(typeof m.avg_duration_seconds).toBe("number");
  });
});
