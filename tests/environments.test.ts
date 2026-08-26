import { describe, it, expect } from "vitest";
import {
  listEnvironments,
  getEnvironment,
  createEnvironment,
  updateEnvironmentStatus,
  deleteEnvironment,
} from "@/lib/environments";

describe("environments", () => {
  it("lists seed environments", () => {
    const envs = listEnvironments();
    expect(envs.length).toBeGreaterThanOrEqual(4);
  });

  it("gets environment by id", () => {
    const env = getEnvironment("env-prod");
    expect(env).not.toBeNull();
    expect(env!.name).toBe("Production");
  });

  it("returns null for unknown id", () => {
    expect(getEnvironment("env-nope")).toBeNull();
  });

  it("creates an environment", () => {
    const env = createEnvironment("Preview", "https://preview.example.com", "feature/x");
    expect(env.name).toBe("Preview");
    expect(env.status).toBe("inactive");
    expect(env.last_deployed_at).toBeNull();
  });

  it("updates environment status", () => {
    const env = updateEnvironmentStatus("env-staging", "deploying");
    expect(env).not.toBeNull();
    expect(env!.status).toBe("deploying");
    updateEnvironmentStatus("env-staging", "active");
  });

  it("sets last_deployed_at on active", () => {
    const env = createEnvironment("Temp", "https://tmp.example.com", "tmp");
    expect(env.last_deployed_at).toBeNull();
    const updated = updateEnvironmentStatus(env.id, "active");
    expect(updated!.last_deployed_at).not.toBeNull();
  });

  it("deletes an environment", () => {
    const env = createEnvironment("Del", "https://del.example.com", "del");
    expect(deleteEnvironment(env.id)).toBe(true);
    expect(deleteEnvironment(env.id)).toBe(false);
  });
});
