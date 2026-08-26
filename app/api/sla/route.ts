import { NextResponse } from "next/server";
import { dbListIssues } from "@/lib/db";
import { getPolicies, checkSlaStatus } from "@/lib/sla";

export async function GET() {
  const issues = await dbListIssues();
  const policies = getPolicies();

  const statuses = issues
    .filter((i) => i.status !== "done" && i.status !== "cancelled")
    .map((i) => {
      const resolved = i.status === "done" ? i.updated_at : null;
      const responded = i.status !== "backlog" && i.status !== "open" ? i.updated_at : null;
      const sla = checkSlaStatus(i.priority, i.created_at, responded, resolved);
      return { ...sla, issue_id: i.id, title: i.title };
    });

  const breached = statuses.filter((s) => s.response_breached || s.resolution_breached);
  const atRisk = statuses.filter((s) => {
    if (s.response_breached || s.resolution_breached) return false;
    const respDeadline = new Date(s.response_deadline).getTime();
    const resDeadline = new Date(s.resolution_deadline).getTime();
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    return (respDeadline - now < oneHour && !s.responded_at) || (resDeadline - now < oneHour * 4 && !s.resolved_at);
  });

  return NextResponse.json({
    policies,
    statuses,
    summary: {
      total: statuses.length,
      breached: breached.length,
      at_risk: atRisk.length,
      healthy: statuses.length - breached.length - atRisk.length,
    },
  });
}
