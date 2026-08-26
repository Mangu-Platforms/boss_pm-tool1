import { describe, it, expect } from "vitest";
import {
  listAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  matchAutomation,
  getTriggeredAutomations,
} from "@/lib/automations";

describe("automations", () => {
  it("lists default automations", () => {
    const autos = listAutomations();
    expect(autos.length).toBeGreaterThanOrEqual(2);
  });

  it("gets automation by id", () => {
    const a = getAutomation("auto-1");
    expect(a).toBeTruthy();
    expect(a!.name).toContain("critical");
  });

  it("creates automation", () => {
    const a = createAutomation(
      "Test Rule",
      "status_changed",
      [{ field: "status", operator: "equals", value: "done" }],
      [{ type: "add_label", value: "shipped" }]
    );
    expect(a.enabled).toBe(true);
    expect(a.trigger).toBe("status_changed");
  });

  it("updates automation", () => {
    const a = createAutomation("Updatable", "issue_created", [], [{ type: "notify", value: "test" }]);
    const updated = updateAutomation(a.id, { enabled: false, name: "Updated" });
    expect(updated!.enabled).toBe(false);
    expect(updated!.name).toBe("Updated");
  });

  it("deletes automation", () => {
    const a = createAutomation("To Delete", "issue_created", [], [{ type: "notify", value: "x" }]);
    expect(deleteAutomation(a.id)).toBe(true);
    expect(getAutomation(a.id)).toBeNull();
  });

  it("matches conditions - equals", () => {
    const a = createAutomation("Match Eq", "issue_created", [{ field: "priority", operator: "equals", value: "high" }], [{ type: "notify", value: "hi" }]);
    expect(matchAutomation(a, { priority: "high" })).toBe(true);
    expect(matchAutomation(a, { priority: "low" })).toBe(false);
  });

  it("matches conditions - not_equals", () => {
    const a = createAutomation("Match NE", "issue_created", [{ field: "status", operator: "not_equals", value: "done" }], [{ type: "notify", value: "x" }]);
    expect(matchAutomation(a, { status: "open" })).toBe(true);
    expect(matchAutomation(a, { status: "done" })).toBe(false);
  });

  it("matches conditions - contains", () => {
    const a = createAutomation("Match Cont", "issue_created", [{ field: "title", operator: "contains", value: "bug" }], [{ type: "notify", value: "x" }]);
    expect(matchAutomation(a, { title: "fix bug in auth" })).toBe(true);
    expect(matchAutomation(a, { title: "add feature" })).toBe(false);
  });

  it("disabled automation does not match", () => {
    const a = createAutomation("Disabled", "issue_created", [], [{ type: "notify", value: "x" }]);
    updateAutomation(a.id, { enabled: false });
    expect(matchAutomation(a, {})).toBe(false);
  });

  it("gets triggered automations", () => {
    const triggered = getTriggeredAutomations("issue_created", { priority: "critical" });
    expect(triggered.length).toBeGreaterThanOrEqual(1);
  });
});
