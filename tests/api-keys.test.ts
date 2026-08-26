import { describe, it, expect } from "vitest";
import { listApiKeys, getApiKey, createApiKey, revokeApiKey, deleteApiKey, validateApiKey } from "@/lib/api-keys";

describe("api-keys", () => {
  it("lists keys without full secret", () => {
    const keys = listApiKeys();
    expect(keys.length).toBeGreaterThanOrEqual(2);
    keys.forEach((k) => {
      expect((k as unknown as { key?: string }).key).toBeUndefined();
    });
  });

  it("gets key with full secret", () => {
    const key = getApiKey("ak-1");
    expect(key).not.toBeNull();
    expect(key!.key).toContain("bpm_");
  });

  it("creates a key", () => {
    const key = createApiKey("Test Key", ["read:issues"]);
    expect(key.key.startsWith("bpm_")).toBe(true);
    expect(key.active).toBe(true);
    expect(key.scopes).toContain("read:issues");
  });

  it("revokes a key", () => {
    const key = createApiKey("Revoke Test", []);
    expect(revokeApiKey(key.id)).toBe(true);
    const fetched = getApiKey(key.id);
    expect(fetched!.active).toBe(false);
  });

  it("validates an active key", () => {
    const key = createApiKey("Validate Test", ["read:issues"]);
    const result = validateApiKey(key.key);
    expect(result).not.toBeNull();
    expect(result!.last_used_at).not.toBeNull();
  });

  it("rejects revoked key", () => {
    const key = createApiKey("Reject Test", []);
    revokeApiKey(key.id);
    expect(validateApiKey(key.key)).toBeNull();
  });

  it("deletes a key", () => {
    const key = createApiKey("Del Test", []);
    expect(deleteApiKey(key.id)).toBe(true);
    expect(deleteApiKey(key.id)).toBe(false);
  });
});
