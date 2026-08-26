import { describe, it, expect } from "vitest";
import { getPrefs, updatePref, muteAll, unmuteAll, listEvents } from "@/lib/notification-prefs";

describe("notification-prefs", () => {
  const userId = "test-user-prefs";

  it("initializes defaults on first access", () => {
    const prefs = getPrefs(userId);
    expect(prefs.length).toBe(listEvents().length);
    expect(prefs.every((p) => p.enabled)).toBe(true);
  });

  it("updates a pref", () => {
    const pref = updatePref(userId, "issue.assigned", ["email", "slack"], true);
    expect(pref.channels).toContain("email");
    expect(pref.channels).toContain("slack");
  });

  it("mutes all", () => {
    muteAll(userId);
    const prefs = getPrefs(userId);
    expect(prefs.every((p) => !p.enabled)).toBe(true);
  });

  it("unmutes all", () => {
    unmuteAll(userId);
    const prefs = getPrefs(userId);
    expect(prefs.every((p) => p.enabled)).toBe(true);
  });

  it("lists available events", () => {
    const events = listEvents();
    expect(events).toContain("issue.assigned");
    expect(events).toContain("sla.breached");
  });
});
