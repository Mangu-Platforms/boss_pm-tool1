export type AutomationTrigger = "issue_created" | "issue_status_changed" | "issue_assigned" | "sprint_started" | "sprint_ended" | "milestone_completed" | "sla_breached";
export type AutomationActionType = "assign" | "change_status" | "add_label" | "send_notification" | "move_to_sprint" | "set_priority";

export type AutomationAction = {
  type: AutomationActionType;
  params: Record<string, string>;
};

export type AutomationRule = {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  conditions: { field: string; operator: string; value: string }[];
  actions: AutomationAction[];
  enabled: boolean;
  run_count: number;
  last_run_at: string | null;
  created_at: string;
};

let nextId = 4;
function genId() { return `auto-${nextId++}`; }

const store: AutomationRule[] = [
  {
    id: "auto-1", name: "Auto-assign high priority", trigger: "issue_created",
    conditions: [{ field: "priority", operator: "eq", value: "critical" }],
    actions: [{ type: "assign", params: { assignee: "max" } }],
    enabled: true, run_count: 5, last_run_at: "2025-03-20T10:00:00Z", created_at: "2025-02-01T10:00:00Z",
  },
  {
    id: "auto-2", name: "Notify on SLA breach", trigger: "sla_breached",
    conditions: [],
    actions: [{ type: "send_notification", params: { channel: "slack", message: "SLA breached!" } }],
    enabled: true, run_count: 2, last_run_at: "2025-03-18T10:00:00Z", created_at: "2025-02-01T10:00:00Z",
  },
  {
    id: "auto-3", name: "Move done to archive", trigger: "issue_status_changed",
    conditions: [{ field: "status", operator: "eq", value: "done" }],
    actions: [{ type: "add_label", params: { label: "archived" } }],
    enabled: false, run_count: 0, last_run_at: null, created_at: "2025-03-01T10:00:00Z",
  },
];

export function listAutomations(enabled?: boolean): AutomationRule[] {
  if (enabled !== undefined) return store.filter((r) => r.enabled === enabled);
  return [...store];
}

export function getAutomation(id: string): AutomationRule | null {
  return store.find((r) => r.id === id) || null;
}

export function createAutomation(name: string, trigger: AutomationTrigger, conditions: AutomationRule["conditions"], actions: AutomationAction[]): AutomationRule {
  const rule: AutomationRule = { id: genId(), name, trigger, conditions, actions, enabled: true, run_count: 0, last_run_at: null, created_at: new Date().toISOString() };
  store.push(rule);
  return rule;
}

export function updateAutomation(id: string, updates: Partial<Pick<AutomationRule, "name" | "trigger" | "conditions" | "actions" | "enabled">>): AutomationRule | null {
  const r = store.find((rl) => rl.id === id);
  if (!r) return null;
  if (updates.name !== undefined) r.name = updates.name;
  if (updates.trigger !== undefined) r.trigger = updates.trigger;
  if (updates.conditions !== undefined) r.conditions = updates.conditions;
  if (updates.actions !== undefined) r.actions = updates.actions;
  if (updates.enabled !== undefined) r.enabled = updates.enabled;
  return r;
}

export function executeAutomation(id: string): { success: boolean; actions_executed: number } | null {
  const r = store.find((rl) => rl.id === id);
  if (!r || !r.enabled) return null;
  r.run_count++;
  r.last_run_at = new Date().toISOString();
  return { success: true, actions_executed: r.actions.length };
}

export function deleteAutomation(id: string): boolean {
  const idx = store.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function matchingAutomations(trigger: AutomationTrigger): AutomationRule[] {
  return store.filter((r) => r.enabled && r.trigger === trigger);
}
