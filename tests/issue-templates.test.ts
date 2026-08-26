import { describe, it, expect } from "vitest";
import { listIssueTemplates, getIssueTemplate, createIssueTemplate, updateIssueTemplate, deleteIssueTemplate } from "@/lib/issue-templates";

describe("issue-templates", () => {
  it("lists default templates", () => {
    const templates = listIssueTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(4);
    expect(templates.find((t) => t.name === "Bug Report")).toBeTruthy();
  });

  it("gets template by id", () => {
    const tmpl = getIssueTemplate("tmpl-bug");
    expect(tmpl).toBeTruthy();
    expect(tmpl!.body_template).toContain("Steps to Reproduce");
  });

  it("returns null for unknown", () => {
    expect(getIssueTemplate("nope")).toBeNull();
  });

  it("creates a template", () => {
    const tmpl = createIssueTemplate("Custom", "A custom template", "[Custom] ", "## Custom\n", "high", ["custom"]);
    expect(tmpl.name).toBe("Custom");
    expect(tmpl.default_priority).toBe("high");
  });

  it("updates a template", () => {
    const tmpl = createIssueTemplate("Updatable", "desc", "", "");
    const updated = updateIssueTemplate(tmpl.id, { name: "Updated Name", default_priority: "critical" });
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe("Updated Name");
    expect(updated!.default_priority).toBe("critical");
  });

  it("update returns null for unknown", () => {
    expect(updateIssueTemplate("nonexistent", { name: "X" })).toBeNull();
  });

  it("deletes a template", () => {
    const tmpl = createIssueTemplate("To Delete", "", "", "");
    expect(deleteIssueTemplate(tmpl.id)).toBe(true);
    expect(getIssueTemplate(tmpl.id)).toBeNull();
  });
});
