import { describe, it, expect } from "vitest";
import { listProjectTemplates, getProjectTemplate, createProjectTemplate, deleteProjectTemplate } from "@/lib/project-templates";

describe("project templates", () => {
  it("lists default templates", () => {
    const tpls = listProjectTemplates();
    expect(tpls.length).toBeGreaterThanOrEqual(3);
    expect(tpls.find((t) => t.name === "MVP Launch")).toBeTruthy();
  });

  it("gets template by id", () => {
    const tpl = getProjectTemplate("tpl-mvp");
    expect(tpl).toBeTruthy();
    expect(tpl!.issues.length).toBe(6);
  });

  it("returns null for unknown", () => {
    expect(getProjectTemplate("nope")).toBeNull();
  });

  it("creates a template", () => {
    const tpl = createProjectTemplate("Custom", "My template", [
      { title: "Task 1", body: "Do thing", priority: "medium", labels: [] },
    ]);
    expect(tpl.name).toBe("Custom");
    expect(tpl.issues.length).toBe(1);
  });

  it("deletes a template", () => {
    const tpl = createProjectTemplate("To Delete", "", []);
    expect(deleteProjectTemplate(tpl.id)).toBe(true);
    expect(getProjectTemplate(tpl.id)).toBeNull();
  });

  it("returns false for unknown delete", () => {
    expect(deleteProjectTemplate("nope")).toBe(false);
  });
});
