import { describe, it, expect } from "vitest";
import { exportIssues, exportProducts, exportMilestones, parseCSV } from "@/lib/import-export";

describe("import-export", () => {
  it("exports issues as JSON", () => {
    const json = exportIssues("json");
    const data = JSON.parse(json);
    expect(data.issues).toBeDefined();
    expect(data.exported_at).toBeDefined();
  });

  it("exports issues as CSV", () => {
    const csv = exportIssues("csv");
    expect(csv).toContain("id,title,status,priority,assignee_user,due_on");
    const lines = csv.split("\n");
    expect(lines.length).toBeGreaterThan(1);
  });

  it("exports products as JSON", () => {
    const json = exportProducts("json");
    const data = JSON.parse(json);
    expect(data.products).toBeDefined();
  });

  it("exports milestones as CSV", () => {
    const csv = exportMilestones("csv");
    expect(csv).toContain("id,name,status,due_on");
  });

  it("parses CSV into records", () => {
    const csv = 'name,age\n"Alice","30"\n"Bob","25"';
    const rows = parseCSV(csv);
    expect(rows.length).toBe(2);
    expect(rows[0].name).toBe("Alice");
    expect(rows[1].age).toBe("25");
  });

  it("returns empty for single-line CSV", () => {
    expect(parseCSV("header")).toEqual([]);
  });
});
