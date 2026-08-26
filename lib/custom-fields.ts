export type FieldType = "text" | "number" | "select" | "url" | "date";

export type CustomField = {
  id: string;
  name: string;
  type: FieldType;
  options?: string[];
  required: boolean;
};

export type FieldValue = {
  issue_id: string;
  field_id: string;
  value: string;
};

const fields: CustomField[] = [
  { id: "cf-epic", name: "Epic", type: "text", required: false },
  { id: "cf-sprint", name: "Sprint", type: "number", required: false },
  { id: "cf-env", name: "Environment", type: "select", options: ["prod", "staging", "dev"], required: false },
];

const values: FieldValue[] = [];

export function listCustomFields(): CustomField[] {
  return [...fields];
}

export function createCustomField(name: string, type: FieldType, options?: string[], required = false): CustomField {
  const field: CustomField = {
    id: crypto.randomUUID(),
    name,
    type,
    options: type === "select" ? options : undefined,
    required,
  };
  fields.push(field);
  return field;
}

export function deleteCustomField(id: string): boolean {
  const idx = fields.findIndex((f) => f.id === id);
  if (idx < 0) return false;
  fields.splice(idx, 1);
  const toRemove = values.filter((v) => v.field_id === id);
  for (const v of toRemove) {
    const i = values.indexOf(v);
    if (i >= 0) values.splice(i, 1);
  }
  return true;
}

export function setFieldValue(issueId: string, fieldId: string, value: string): void {
  const existing = values.find((v) => v.issue_id === issueId && v.field_id === fieldId);
  if (existing) {
    existing.value = value;
  } else {
    values.push({ issue_id: issueId, field_id: fieldId, value });
  }
}

export function getFieldValues(issueId: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const v of values) {
    if (v.issue_id === issueId) {
      result[v.field_id] = v.value;
    }
  }
  return result;
}

export function clearFieldValue(issueId: string, fieldId: string): void {
  const idx = values.findIndex((v) => v.issue_id === issueId && v.field_id === fieldId);
  if (idx >= 0) values.splice(idx, 1);
}
