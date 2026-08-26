import type { IssuePriority } from "./types";

export type SlaPolicy = {
  priority: IssuePriority;
  response_hours: number;
  resolution_hours: number;
};

export type SlaStatus = {
  issue_id: string;
  priority: IssuePriority;
  created_at: string;
  response_deadline: string;
  resolution_deadline: string;
  responded_at: string | null;
  resolved_at: string | null;
  response_breached: boolean;
  resolution_breached: boolean;
};

const policies: SlaPolicy[] = [
  { priority: "critical", response_hours: 1, resolution_hours: 4 },
  { priority: "high", response_hours: 4, resolution_hours: 24 },
  { priority: "medium", response_hours: 8, resolution_hours: 72 },
  { priority: "low", response_hours: 24, resolution_hours: 168 },
];

export function getPolicies(): SlaPolicy[] {
  return [...policies];
}

export function getPolicy(priority: IssuePriority): SlaPolicy {
  return policies.find((p) => p.priority === priority) || policies[2];
}

export function calculateSla(priority: IssuePriority, createdAt: string): Omit<SlaStatus, "issue_id" | "responded_at" | "resolved_at" | "response_breached" | "resolution_breached"> {
  const policy = getPolicy(priority);
  const created = new Date(createdAt);
  const responseDeadline = new Date(created.getTime() + policy.response_hours * 60 * 60 * 1000);
  const resolutionDeadline = new Date(created.getTime() + policy.resolution_hours * 60 * 60 * 1000);
  return {
    priority,
    created_at: createdAt,
    response_deadline: responseDeadline.toISOString(),
    resolution_deadline: resolutionDeadline.toISOString(),
  };
}

export function checkSlaStatus(
  priority: IssuePriority,
  createdAt: string,
  respondedAt: string | null,
  resolvedAt: string | null
): SlaStatus & { issue_id: string } {
  const sla = calculateSla(priority, createdAt);
  const now = new Date();

  const responseBreached = respondedAt
    ? new Date(respondedAt) > new Date(sla.response_deadline)
    : now > new Date(sla.response_deadline);

  const resolutionBreached = resolvedAt
    ? new Date(resolvedAt) > new Date(sla.resolution_deadline)
    : now > new Date(sla.resolution_deadline);

  return {
    issue_id: "",
    ...sla,
    responded_at: respondedAt,
    resolved_at: resolvedAt,
    response_breached: responseBreached,
    resolution_breached: resolutionBreached,
  };
}

export function timeRemaining(deadline: string): { hours: number; minutes: number; overdue: boolean } {
  const diff = new Date(deadline).getTime() - Date.now();
  const overdue = diff < 0;
  const absDiff = Math.abs(diff);
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes, overdue };
}
