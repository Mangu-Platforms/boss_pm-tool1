import { describe, it, expect } from "vitest";
import { listIntegrations, getIntegration, updateIntegrationStatus } from "@/lib/integrations";

describe("integrations", () => {
  it("lists default integrations", () => {
    const ints = listIntegrations();
    expect(ints.length).toBe(5);
    expect(ints.find((i) => i.provider === "github")).toBeTruthy();
  });

  it("gets integration by id", () => {
    const int = getIntegration("int-github");
    expect(int).toBeTruthy();
    expect(int!.status).toBe("connected");
  });

  it("returns null for unknown", () => {
    expect(getIntegration("nope")).toBeNull();
  });

  it("connects a disconnected integration", () => {
    const int = updateIntegrationStatus("int-linear", "connected", { team: "engineering" });
    expect(int!.status).toBe("connected");
    expect(int!.connected_at).toBeTruthy();
    expect(int!.config.team).toBe("engineering");
  });

  it("disconnects a connected integration", () => {
    const int = updateIntegrationStatus("int-github", "disconnected");
    expect(int!.status).toBe("disconnected");
  });
});
