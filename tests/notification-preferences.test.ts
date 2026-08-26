import { describe, it, expect } from "vitest";
import { listPreferences, getPreference, setPreference, togglePreference, deletePreference, shouldNotify } from "../lib/notification-preferences";

describe("notification-preferences", () => {
  it("lists preferences for user", () => {
    const prefs = listPreferences("max");
    expect(prefs.length).toBeGreaterThanOrEqual(4);
    expect(prefs.every((p) => p.user_id === "max")).toBe(true);
  });

  it("gets preference by id", () => {
    const p = getPreference("npref-1");
    expect(p).not.toBeNull();
    expect(p!.event_type).toBe("issue_created");
  });

  it("sets new preference", () => {
    const p = setPreference("bob", "sprint_started", ["email", "slack"]);
    expect(p.user_id).toBe("bob");
    expect(p.channels).toContain("email");
  });

  it("updates existing preference", () => {
    setPreference("bob", "sprint_started", ["in_app"]);
    const prefs = listPreferences("bob");
    const p = prefs.find((pr) => pr.event_type === "sprint_started");
    expect(p!.channels).toEqual(["in_app"]);
  });

  it("checks should notify", () => {
    expect(shouldNotify("max", "issue_created", "email")).toBe(true);
    expect(shouldNotify("max", "issue_created", "webhook")).toBe(false);
  });

  it("toggles preference", () => {
    const p = setPreference("toggle-test", "sprint_ended", ["email"], true);
    expect(p.enabled).toBe(true);
    togglePreference(p.id);
    expect(getPreference(p.id)!.enabled).toBe(false);
    togglePreference(p.id);
    expect(getPreference(p.id)!.enabled).toBe(true);
  });

  it("deletes preference", () => {
    const p = setPreference("temp", "comment_added", ["email"]);
    expect(deletePreference(p.id)).toBe(true);
  });
});
