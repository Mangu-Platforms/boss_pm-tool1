import { NextResponse } from "next/server";
import { dbListProducts, dbListIssues, dbListLinks } from "@/lib/db";

export async function GET() {
  const [products, issues, links] = await Promise.all([
    dbListProducts(),
    dbListIssues(),
    dbListLinks(),
  ]);

  const cashEngineProducts = products.filter((p) => p.engine_tag === "cash-engine");
  const labProducts = products.filter((p) => p.engine_tag === "lab");
  const openIssues = issues.filter((i) => i.status === "open" || i.status === "doing");
  const agentIssues = issues.filter((i) => i.assignee_kind === "agent");
  const totalCapCents = agentIssues.reduce((acc, i) => acc + (i.cost_cap_cents || 0), 0);

  const doneIssues = issues.filter((i) => i.status === "done");
  let avgDays: number | null = null;
  if (doneIssues.length > 0) {
    const totalDays = doneIssues.reduce((acc, i) => {
      const created = new Date(i.created_at).getTime();
      const updated = new Date(i.updated_at).getTime();
      return acc + (updated - created) / (1000 * 60 * 60 * 24);
    }, 0);
    avgDays = Math.round((totalDays / doneIssues.length) * 10) / 10;
  }

  const byPriority: Record<string, number> = {};
  for (const i of issues) {
    byPriority[i.priority] = (byPriority[i.priority] || 0) + 1;
  }

  const byAssigneeKind: Record<string, number> = {};
  for (const i of issues) {
    byAssigneeKind[i.assignee_kind] = (byAssigneeKind[i.assignee_kind] || 0) + 1;
  }

  return NextResponse.json({
    products: {
      total: products.length,
      cash_engine: cashEngineProducts.length,
      lab: labProducts.length,
    },
    issues: {
      total: issues.length,
      open: openIssues.length,
      agent_assigned: agentIssues.length,
      total_cap_cents: totalCapCents,
      by_status: {
        open: issues.filter((i) => i.status === "open").length,
        doing: issues.filter((i) => i.status === "doing").length,
        done: issues.filter((i) => i.status === "done").length,
        backlog: issues.filter((i) => i.status === "backlog").length,
        cancelled: issues.filter((i) => i.status === "cancelled").length,
      },
      by_priority: byPriority,
      by_assignee_kind: byAssigneeKind,
    },
    github_links: links.length,
    velocity: {
      done_count: doneIssues.length,
      avg_days_to_close: avgDays,
    },
  });
}
