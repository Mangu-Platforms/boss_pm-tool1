export type ImpactSeverity = "none" | "low" | "medium" | "high" | "critical";
export type ImpactArea = "performance" | "security" | "usability" | "reliability" | "cost" | "compliance";

export type ImpactItem = {
  id: string;
  change_request_id: string;
  area: ImpactArea;
  severity: ImpactSeverity;
  description: string;
  mitigation: string;
  affected_users: number;
  estimated_effort_hours: number;
  created_at: string;
};

export type ImpactReport = {
  change_request_id: string;
  items: ImpactItem[];
  overall_severity: ImpactSeverity;
  total_effort_hours: number;
  total_affected_users: number;
  areas_impacted: ImpactArea[];
};

const impactItems: ImpactItem[] = [
  { id: "imp-1", change_request_id: "cr-1", area: "performance", severity: "high", description: "DB downtime during migration", mitigation: "Blue-green deploy", affected_users: 5000, estimated_effort_hours: 40, created_at: "2025-08-01T12:00:00Z" },
  { id: "imp-2", change_request_id: "cr-1", area: "reliability", severity: "medium", description: "Potential data inconsistencies", mitigation: "Pre-migration validation", affected_users: 5000, estimated_effort_hours: 16, created_at: "2025-08-01T12:00:00Z" },
  { id: "imp-3", change_request_id: "cr-2", area: "usability", severity: "low", description: "API consumers may hit rate limits", mitigation: "Communicate limits, provide dashboard", affected_users: 200, estimated_effort_hours: 8, created_at: "2025-07-20T10:00:00Z" },
  { id: "imp-4", change_request_id: "cr-2", area: "security", severity: "none", description: "Improved protection against abuse", mitigation: "N/A - positive impact", affected_users: 0, estimated_effort_hours: 0, created_at: "2025-07-20T10:00:00Z" },
  { id: "imp-5", change_request_id: "cr-3", area: "performance", severity: "medium", description: "Higher throughput but more memory", mitigation: "Auto-scaling configuration", affected_users: 3000, estimated_effort_hours: 24, created_at: "2025-08-15T14:00:00Z" },
  { id: "imp-6", change_request_id: "cr-3", area: "cost", severity: "medium", description: "Increased infrastructure costs", mitigation: "Budget allocation approved", affected_users: 0, estimated_effort_hours: 4, created_at: "2025-08-15T14:00:00Z" },
];

let nextId = 7;

const severityOrder: Record<ImpactSeverity, number> = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };

export function impactForChangeRequest(crId: string): ImpactItem[] {
  return impactItems.filter((i) => i.change_request_id === crId).sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
}

export function addImpactItem(crId: string, area: ImpactArea, severity: ImpactSeverity, description: string, mitigation: string, affectedUsers: number, effortHours: number): ImpactItem {
  const item: ImpactItem = {
    id: `imp-${nextId++}`,
    change_request_id: crId,
    area,
    severity,
    description,
    mitigation,
    affected_users: affectedUsers,
    estimated_effort_hours: effortHours,
    created_at: new Date().toISOString(),
  };
  impactItems.push(item);
  return item;
}

export function removeImpactItem(id: string): boolean {
  const idx = impactItems.findIndex((i) => i.id === id);
  if (idx < 0) return false;
  impactItems.splice(idx, 1);
  return true;
}

export function impactReport(crId: string): ImpactReport {
  const items = impactForChangeRequest(crId);
  const maxSeverity = items.reduce<ImpactSeverity>((max, i) => (severityOrder[i.severity] > severityOrder[max] ? i.severity : max), "none");
  return {
    change_request_id: crId,
    items,
    overall_severity: maxSeverity,
    total_effort_hours: items.reduce((s, i) => s + i.estimated_effort_hours, 0),
    total_affected_users: Math.max(...items.map((i) => i.affected_users), 0),
    areas_impacted: [...new Set(items.map((i) => i.area))],
  };
}

export function highRiskItems(): ImpactItem[] {
  return impactItems.filter((i) => i.severity === "high" || i.severity === "critical").sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
}
