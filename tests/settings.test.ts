import { describe, it, expect } from "vitest";
import { listSettings, getSetting, updateSetting, settingsByCategory } from "../lib/settings";

describe("settings", () => {
  it("lists all settings", () => {
    const all = listSettings();
    expect(all.length).toBeGreaterThanOrEqual(10);
  });

  it("filters by category", () => {
    const notif = listSettings("notifications");
    expect(notif.every((s) => s.category === "notifications")).toBe(true);
    expect(notif.length).toBeGreaterThan(0);
  });

  it("gets setting by key", () => {
    const s = getSetting("project.name");
    expect(s).not.toBeNull();
    expect(s!.value).toBe("Boss PM");
  });

  it("updates setting", () => {
    const s = updateSetting("project.name", "Boss PM v2");
    expect(s).not.toBeNull();
    expect(s!.value).toBe("Boss PM v2");
    updateSetting("project.name", "Boss PM");
  });

  it("returns null for unknown key", () => {
    expect(getSetting("nonexistent.key")).toBeNull();
    expect(updateSetting("nonexistent.key", "val")).toBeNull();
  });

  it("groups by category", () => {
    const grouped = settingsByCategory();
    expect(grouped.general).toBeDefined();
    expect(grouped.notifications).toBeDefined();
    expect(grouped.display).toBeDefined();
  });
});
