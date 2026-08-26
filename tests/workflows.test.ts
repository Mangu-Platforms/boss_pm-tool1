import { describe, it, expect } from "vitest";
import { listWorkflows, getWorkflow, createWorkflow, updateWorkflow, addWorkflowStep, deleteWorkflow, runWorkflow } from "@/lib/workflows";

describe("workflows", () => {
  it("lists seed workflows", () => {
    const wfs = listWorkflows();
    expect(wfs.length).toBeGreaterThanOrEqual(2);
  });

  it("gets workflow by id", () => {
    const wf = getWorkflow("wf-1");
    expect(wf).not.toBeNull();
    expect(wf!.name).toContain("Auto-assign");
  });

  it("creates a workflow", () => {
    const wf = createWorkflow("Test WF", "desc", "manual", [
      { action: "notify", config: { channel: "test" } },
    ]);
    expect(wf.steps.length).toBe(1);
    expect(wf.enabled).toBe(true);
    expect(wf.run_count).toBe(0);
  });

  it("updates a workflow", () => {
    const wf = createWorkflow("Update Test", "", "manual", []);
    const updated = updateWorkflow(wf.id, { enabled: false, name: "Updated" });
    expect(updated).not.toBeNull();
    expect(updated!.enabled).toBe(false);
    expect(updated!.name).toBe("Updated");
  });

  it("adds a step", () => {
    const wf = createWorkflow("Step Test", "", "manual", []);
    const updated = addWorkflowStep(wf.id, "assign", { user: "bob" });
    expect(updated).not.toBeNull();
    expect(updated!.steps.length).toBe(1);
  });

  it("runs a workflow", () => {
    const wf = createWorkflow("Run Test", "", "manual", []);
    const ran = runWorkflow(wf.id);
    expect(ran).not.toBeNull();
    expect(ran!.run_count).toBe(1);
  });

  it("cannot run disabled workflow", () => {
    const wf = createWorkflow("Disabled", "", "manual", []);
    updateWorkflow(wf.id, { enabled: false });
    expect(runWorkflow(wf.id)).toBeNull();
  });

  it("deletes a workflow", () => {
    const wf = createWorkflow("Del Test", "", "manual", []);
    expect(deleteWorkflow(wf.id)).toBe(true);
    expect(deleteWorkflow(wf.id)).toBe(false);
  });
});
