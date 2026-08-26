import { describe, it, expect } from "vitest";
import {
  listWebhooks,
  getWebhook,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  triggerWebhook,
} from "@/lib/webhooks";

describe("webhooks", () => {
  it("lists seed webhooks with masked secrets", () => {
    const whs = listWebhooks();
    expect(whs.length).toBeGreaterThanOrEqual(2);
    expect(whs[0].secret).toBe("***");
  });

  it("gets webhook by id with full secret", () => {
    const wh = getWebhook("wh-1");
    expect(wh).not.toBeNull();
    expect(wh!.secret).not.toBe("***");
  });

  it("creates a webhook", () => {
    const wh = createWebhook("Test Hook", "https://example.com/hook", ["issue.created"]);
    expect(wh.name).toBe("Test Hook");
    expect(wh.active).toBe(true);
    expect(wh.secret).toContain("whsec_");
  });

  it("updates a webhook", () => {
    const wh = createWebhook("Update Test", "https://example.com/up", ["issue.updated"]);
    const updated = updateWebhook(wh.id, { active: false, name: "Updated" });
    expect(updated).not.toBeNull();
    expect(updated!.active).toBe(false);
    expect(updated!.name).toBe("Updated");
  });

  it("triggers a webhook", () => {
    const wh = createWebhook("Trigger Test", "https://example.com/trig", ["sprint.started"]);
    expect(wh.last_triggered_at).toBeNull();
    const triggered = triggerWebhook(wh.id);
    expect(triggered).not.toBeNull();
    expect(triggered!.last_triggered_at).not.toBeNull();
  });

  it("deletes a webhook", () => {
    const wh = createWebhook("Del Test", "https://example.com/del", ["comment.created"]);
    expect(deleteWebhook(wh.id)).toBe(true);
    expect(deleteWebhook(wh.id)).toBe(false);
  });
});
