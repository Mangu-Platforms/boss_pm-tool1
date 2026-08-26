import { describe, it, expect } from "vitest";
import { listCustomFields, createCustomField, deleteCustomField, setFieldValue, getFieldValues, clearFieldValue } from "@/lib/custom-fields";

describe("custom fields", () => {
  it("lists default fields", () => {
    const fields = listCustomFields();
    expect(fields.length).toBeGreaterThanOrEqual(3);
    expect(fields.find((f) => f.name === "Epic")).toBeTruthy();
  });

  it("creates a new field", () => {
    const f = createCustomField("Story Points", "number");
    expect(f.name).toBe("Story Points");
    expect(f.type).toBe("number");
  });

  it("creates a select field with options", () => {
    const f = createCustomField("Platform", "select", ["web", "mobile", "api"]);
    expect(f.options).toEqual(["web", "mobile", "api"]);
  });

  it("sets and gets field values", () => {
    const fields = listCustomFields();
    const epic = fields.find((f) => f.name === "Epic")!;
    setFieldValue("cf-issue-1", epic.id, "Auth Redesign");
    const values = getFieldValues("cf-issue-1");
    expect(values[epic.id]).toBe("Auth Redesign");
  });

  it("updates existing value", () => {
    const fields = listCustomFields();
    const epic = fields.find((f) => f.name === "Epic")!;
    setFieldValue("cf-issue-1", epic.id, "Payment Flow");
    const values = getFieldValues("cf-issue-1");
    expect(values[epic.id]).toBe("Payment Flow");
  });

  it("clears a field value", () => {
    const fields = listCustomFields();
    const epic = fields.find((f) => f.name === "Epic")!;
    clearFieldValue("cf-issue-1", epic.id);
    const values = getFieldValues("cf-issue-1");
    expect(values[epic.id]).toBeUndefined();
  });

  it("deletes a field and cascades values", () => {
    const f = createCustomField("Temp", "text");
    setFieldValue("cf-issue-2", f.id, "some value");
    expect(deleteCustomField(f.id)).toBe(true);
    expect(getFieldValues("cf-issue-2")[f.id]).toBeUndefined();
  });
});
