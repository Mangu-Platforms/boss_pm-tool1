import { describe, it, expect } from "vitest";
import {
  listWebhookConfigs,
  getWebhookConfig,
  createWebhookConfig,
  updateWebhookConfig,
  deleteWebhookConfig,
  markWebhookTriggered,
} from "@/lib/webhooks-config";

describe("webhook configs", () => {
  it("lists default webhooks", () => {
    const whs = listWebhookConfigs();
    expect(whs.length).toBeGreaterThanOrEqual(1);
    expect(whs[0].name).toBe("Slack notifications");
  });

  it("gets webhook by id", () => {
    expect(getWebhookConfig("wh-1")).toBeTruthy();
  });

  it("returns null for unknown", () => {
    expect(getWebhookConfig("nope")).toBeNull();
  });

  it("creates a webhook", () => {
    const wh = createWebhookConfig("Test Hook", "https://example.com/hook", ["issue.created", "comment.added"], "sec123");
    expect(wh.enabled).toBe(true);
    expect(wh.events).toContain("issue.created");
    expect(wh.secret).toBe("sec123");
  });

  it("updates a webhook", () => {
    const wh = createWebhookConfig("Updatable", "https://x.com", ["issue.updated"]);
    const updated = updateWebhookConfig(wh.id, { enabled: false, name: "Renamed" });
    expect(updated!.enabled).toBe(false);
    expect(updated!.name).toBe("Renamed");
  });

  it("deletes a webhook", () => {
    const wh = createWebhookConfig("Deletable", "https://x.com", ["issue.deleted"]);
    expect(deleteWebhookConfig(wh.id)).toBe(true);
    expect(getWebhookConfig(wh.id)).toBeNull();
  });

  it("marks webhook triggered", () => {
    const wh = createWebhookConfig("Triggerable", "https://x.com", ["status.changed"]);
    expect(wh.last_triggered_at).toBeNull();
    markWebhookTriggered(wh.id);
    const fetched = getWebhookConfig(wh.id);
    expect(fetched!.last_triggered_at).toBeTruthy();
  });
});
