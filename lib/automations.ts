export type AutomationTrigger =
  | "issue_created"
  | "status_changed"
  | "priority_changed"
  | "assignee_changed"
  | "label_added"
  | "due_date_passed";

export type AutomationAction =
  | { type: "set_status"; value: string }
  | { type: "set_priority"; value: string }
  | { type: "add_label"; value: string }
  | { type: "assign_to"; value: string }
  | { type: "notify"; value: string }
  | { type: "move_to_sprint"; value: string };

export type AutomationCondition = {
  field: string;
  operator: "equals" | "not_equals" | "contains";
  value: string;
};

export type Automation = {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  created_at: string;
};

const store: Automation[] = [
  {
    id: "auto-1",
    name: "Auto-assign critical bugs to Alice",
    enabled: true,
    trigger: "issue_created",
    conditions: [
      { field: "priority", operator: "equals", value: "critical" },
    ],
    actions: [
      { type: "assign_to", value: "alice" },
      { type: "notify", value: "Critical issue created" },
    ],
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "auto-2",
    name: "Move done issues out of active sprint",
    enabled: true,
    trigger: "status_changed",
    conditions: [
      { field: "status", operator: "equals", value: "done" },
    ],
    actions: [
      { type: "add_label", value: "completed" },
    ],
    created_at: "2025-01-01T00:00:00Z",
  },
];

export function listAutomations(): Automation[] {
  return [...store];
}

export function getAutomation(id: string): Automation | null {
  return store.find((a) => a.id === id) || null;
}

export function createAutomation(
  name: string,
  trigger: AutomationTrigger,
  conditions: AutomationCondition[],
  actions: AutomationAction[]
): Automation {
  const auto: Automation = {
    id: crypto.randomUUID(),
    name,
    enabled: true,
    trigger,
    conditions,
    actions,
    created_at: new Date().toISOString(),
  };
  store.push(auto);
  return auto;
}

export function updateAutomation(id: string, updates: Partial<Pick<Automation, "name" | "enabled" | "trigger" | "conditions" | "actions">>): Automation | null {
  const auto = store.find((a) => a.id === id);
  if (!auto) return null;
  if (updates.name !== undefined) auto.name = updates.name;
  if (updates.enabled !== undefined) auto.enabled = updates.enabled;
  if (updates.trigger !== undefined) auto.trigger = updates.trigger;
  if (updates.conditions !== undefined) auto.conditions = updates.conditions;
  if (updates.actions !== undefined) auto.actions = updates.actions;
  return auto;
}

export function deleteAutomation(id: string): boolean {
  const idx = store.findIndex((a) => a.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function matchAutomation(
  auto: Automation,
  issueData: Record<string, string>
): boolean {
  if (!auto.enabled) return false;
  return auto.conditions.every((cond) => {
    const fieldVal = issueData[cond.field] || "";
    switch (cond.operator) {
      case "equals":
        return fieldVal === cond.value;
      case "not_equals":
        return fieldVal !== cond.value;
      case "contains":
        return fieldVal.includes(cond.value);
      default:
        return false;
    }
  });
}

export function getTriggeredAutomations(trigger: AutomationTrigger, issueData: Record<string, string>): Automation[] {
  return store.filter((a) => a.trigger === trigger && matchAutomation(a, issueData));
}
