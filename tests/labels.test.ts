import { describe, it, expect } from "vitest";
import { listLabels, getLabel, getLabelByName, createLabel, updateLabel, deleteLabel, addLabelToIssue, removeLabelFromIssue, labelsForIssue, issuesWithLabel } from "@/lib/labels";

describe("labels", () => {
  it("lists default labels", () => {
    const labels = listLabels();
    expect(labels.length).toBeGreaterThanOrEqual(6);
    expect(labels.find((l) => l.name === "bug")).toBeTruthy();
  });

  it("gets label by id", () => {
    const label = getLabel("lbl-bug");
    expect(label).not.toBeNull();
    expect(label!.name).toBe("bug");
  });

  it("gets label by name case-insensitive", () => {
    const label = getLabelByName("Feature");
    expect(label).not.toBeNull();
    expect(label!.id).toBe("lbl-feature");
  });

  it("returns null for unknown label", () => {
    expect(getLabel("lbl-nope")).toBeNull();
    expect(getLabelByName("nope")).toBeNull();
  });

  it("updates a label", () => {
    const lbl = createLabel("upd-test", "#111");
    const updated = updateLabel(lbl.id, { color: "#222", name: "upd-test-renamed" });
    expect(updated).not.toBeNull();
    expect(updated!.color).toBe("#222");
    expect(updated!.name).toBe("upd-test-renamed");
  });

  it("creates a new label", () => {
    const lbl = createLabel("urgent", "#ff0000");
    expect(lbl.name).toBe("urgent");
    expect(lbl.color).toBe("#ff0000");
  });

  it("returns existing label on duplicate name", () => {
    const lbl1 = createLabel("urgent", "#ff0000");
    const lbl2 = createLabel("Urgent", "#00ff00");
    expect(lbl1.id).toBe(lbl2.id);
  });

  it("adds and lists labels for an issue", () => {
    const labels = listLabels();
    const bugLabel = labels.find((l) => l.name === "bug")!;
    addLabelToIssue("lbl-issue-1", bugLabel.id);
    const issueLabels = labelsForIssue("lbl-issue-1");
    expect(issueLabels.length).toBe(1);
    expect(issueLabels[0].name).toBe("bug");
  });

  it("prevents adding nonexistent label", () => {
    expect(addLabelToIssue("lbl-issue-1", "fake-label")).toBe(false);
  });

  it("removes label from issue", () => {
    const labels = listLabels();
    const bugLabel = labels.find((l) => l.name === "bug")!;
    removeLabelFromIssue("lbl-issue-1", bugLabel.id);
    expect(labelsForIssue("lbl-issue-1").length).toBe(0);
  });

  it("finds issues with a label", () => {
    const labels = listLabels();
    const featureLabel = labels.find((l) => l.name === "feature")!;
    addLabelToIssue("lbl-issue-2", featureLabel.id);
    addLabelToIssue("lbl-issue-3", featureLabel.id);
    expect(issuesWithLabel(featureLabel.id).length).toBe(2);
  });

  it("deletes a label and cascades", () => {
    const lbl = createLabel("temp-label", "#aaa");
    addLabelToIssue("lbl-issue-4", lbl.id);
    expect(deleteLabel(lbl.id)).toBe(true);
    expect(labelsForIssue("lbl-issue-4").length).toBe(0);
    expect(deleteLabel("fake")).toBe(false);
  });
});
