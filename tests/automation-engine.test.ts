import { describe, it, expect } from "vitest";
import { listAutomations, getAutomation, createAutomation, updateAutomation, executeAutomation, deleteAutomation, matchingAutomations } from "../lib/automation-engine";

describe("automation-engine", () => {
  it("lists all automations", () => {
    const all = listAutomations();
    expect(all.length).toBeGreaterThanOrEqual(3);
  });

  it("filters by enabled", () => {
    const enabled = listAutomations(true);
    expect(enabled.every((r) => r.enabled)).toBe(true);
  });

  it("gets automation by id", () => {
    const r = getAutomation("auto-1");
    expect(r).not.toBeNull();
    expect(r!.name).toBe("Auto-assign high priority");
  });

  it("creates automation", () => {
    const r = createAutomation("Test auto", "issue_created", [], [{ type: "assign", params: { assignee: "bob" } }]);
    expect(r.name).toBe("Test auto");
    expect(r.enabled).toBe(true);
    expect(r.run_count).toBe(0);
  });

  it("updates automation", () => {
    const r = updateAutomation("auto-1", { name: "Updated auto" });
    expect(r).not.toBeNull();
    expect(r!.name).toBe("Updated auto");
  });

  it("executes automation", () => {
    const r = createAutomation("Exec test", "sprint_started", [], [{ type: "send_notification", params: { channel: "email", message: "Sprint!" } }]);
    const result = executeAutomation(r.id);
    expect(result).not.toBeNull();
    expect(result!.success).toBe(true);
    expect(result!.actions_executed).toBe(1);
  });

  it("finds matching automations by trigger", () => {
    const matches = matchingAutomations("issue_created");
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((r) => r.trigger === "issue_created")).toBe(true);
  });

  it("deletes automation", () => {
    const r = createAutomation("Del test", "sprint_ended", [], []);
    expect(deleteAutomation(r.id)).toBe(true);
    expect(getAutomation(r.id)).toBeNull();
  });
});
