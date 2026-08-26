export type AlertCondition = "gt" | "lt" | "eq" | "gte" | "lte";
export type AlertStatus = "active" | "triggered" | "acknowledged" | "resolved";

export type MetricAlert = {
  id: string;
  name: string;
  metric: string;
  condition: AlertCondition;
  threshold: number;
  current_value: number | null;
  status: AlertStatus;
  triggered_at: string | null;
  notifiers: string[];
  created_at: string;
};

let nextId = 4;
function genId() { return `ma-${nextId++}`; }

const store: MetricAlert[] = [
  { id: "ma-1", name: "High open issue count", metric: "issues.open.count", condition: "gt", threshold: 50, current_value: 42, status: "active", triggered_at: null, notifiers: ["max", "alice"], created_at: "2025-02-01T10:00:00Z" },
  { id: "ma-2", name: "Sprint velocity drop", metric: "sprint.velocity", condition: "lt", threshold: 20, current_value: 15, status: "triggered", triggered_at: "2025-03-25T14:00:00Z", notifiers: ["max"], created_at: "2025-02-15T10:00:00Z" },
  { id: "ma-3", name: "SLA breach rate", metric: "sla.breach_rate", condition: "gt", threshold: 5, current_value: 3, status: "active", triggered_at: null, notifiers: ["alice"], created_at: "2025-03-01T10:00:00Z" },
];

export function listAlerts(status?: AlertStatus): MetricAlert[] {
  if (status) return store.filter((a) => a.status === status);
  return [...store];
}

export function getAlert(id: string): MetricAlert | null {
  return store.find((a) => a.id === id) || null;
}

export function createAlert(name: string, metric: string, condition: AlertCondition, threshold: number, notifiers: string[]): MetricAlert {
  const a: MetricAlert = { id: genId(), name, metric, condition, threshold, current_value: null, status: "active", triggered_at: null, notifiers, created_at: new Date().toISOString() };
  store.push(a);
  return a;
}

export function evaluateAlert(id: string, currentValue: number): MetricAlert | null {
  const a = store.find((al) => al.id === id);
  if (!a) return null;
  a.current_value = currentValue;
  let triggered = false;
  switch (a.condition) {
    case "gt": triggered = currentValue > a.threshold; break;
    case "lt": triggered = currentValue < a.threshold; break;
    case "eq": triggered = currentValue === a.threshold; break;
    case "gte": triggered = currentValue >= a.threshold; break;
    case "lte": triggered = currentValue <= a.threshold; break;
  }
  if (triggered && a.status === "active") {
    a.status = "triggered";
    a.triggered_at = new Date().toISOString();
  } else if (!triggered && a.status === "triggered") {
    a.status = "resolved";
  }
  return a;
}

export function acknowledgeAlert(id: string): MetricAlert | null {
  const a = store.find((al) => al.id === id);
  if (!a || a.status !== "triggered") return null;
  a.status = "acknowledged";
  return a;
}

export function deleteAlert(id: string): boolean {
  const idx = store.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}
