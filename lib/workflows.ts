export type WorkflowStep = {
  id: string;
  action: string;
  config: Record<string, unknown>;
  position: number;
};

export type WorkflowTrigger = "manual" | "issue_created" | "issue_updated" | "status_changed" | "assignment_changed";

export type Workflow = {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  enabled: boolean;
  steps: WorkflowStep[];
  created_at: string;
  run_count: number;
};

let nextId = 3;
function genId() { return `wf-${nextId++}`; }
function stepId() { return `ws-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

const store: Workflow[] = [
  {
    id: "wf-1",
    name: "Auto-assign on creation",
    description: "Assigns new issues to the default team member",
    trigger: "issue_created",
    enabled: true,
    steps: [
      { id: "ws-1", action: "assign", config: { user: "alice" }, position: 0 },
      { id: "ws-2", action: "add_label", config: { label: "triage" }, position: 1 },
    ],
    created_at: "2025-03-10T08:00:00Z",
    run_count: 42,
  },
  {
    id: "wf-2",
    name: "Notify on status change",
    description: "Sends a notification when issue status changes",
    trigger: "status_changed",
    enabled: true,
    steps: [
      { id: "ws-3", action: "notify", config: { channel: "general" }, position: 0 },
    ],
    created_at: "2025-03-15T10:00:00Z",
    run_count: 128,
  },
];

export function listWorkflows(): Workflow[] {
  return [...store];
}

export function getWorkflow(id: string): Workflow | null {
  return store.find((w) => w.id === id) || null;
}

export function createWorkflow(
  name: string,
  description: string,
  trigger: WorkflowTrigger,
  steps: { action: string; config: Record<string, unknown> }[]
): Workflow {
  const wf: Workflow = {
    id: genId(),
    name,
    description,
    trigger,
    enabled: true,
    steps: steps.map((s, i) => ({ id: stepId(), action: s.action, config: s.config, position: i })),
    created_at: new Date().toISOString(),
    run_count: 0,
  };
  store.push(wf);
  return wf;
}

export function updateWorkflow(id: string, updates: Partial<Pick<Workflow, "name" | "description" | "trigger" | "enabled">>): Workflow | null {
  const wf = store.find((w) => w.id === id);
  if (!wf) return null;
  if (updates.name !== undefined) wf.name = updates.name;
  if (updates.description !== undefined) wf.description = updates.description;
  if (updates.trigger !== undefined) wf.trigger = updates.trigger;
  if (updates.enabled !== undefined) wf.enabled = updates.enabled;
  return wf;
}

export function addWorkflowStep(workflowId: string, action: string, config: Record<string, unknown>): Workflow | null {
  const wf = store.find((w) => w.id === workflowId);
  if (!wf) return null;
  wf.steps.push({ id: stepId(), action, config, position: wf.steps.length });
  return wf;
}

export function deleteWorkflow(id: string): boolean {
  const idx = store.findIndex((w) => w.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function runWorkflow(id: string): Workflow | null {
  const wf = store.find((w) => w.id === id);
  if (!wf || !wf.enabled) return null;
  wf.run_count++;
  return wf;
}
