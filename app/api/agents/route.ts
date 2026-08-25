import { NextResponse } from "next/server";
import { dbListIssues, dbListProducts } from "@/lib/db";

export async function GET() {
  const [issues, products] = await Promise.all([dbListIssues(), dbListProducts()]);

  const agentIssues = issues.filter((i) => i.assignee_kind === "agent");
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const byAgent: Record<string, { tasks: number; total_cap_cents: number; active: number; done: number }> = {};
  for (const issue of agentIssues) {
    const name = issue.agent_name || "unknown";
    if (!byAgent[name]) byAgent[name] = { tasks: 0, total_cap_cents: 0, active: 0, done: 0 };
    byAgent[name].tasks += 1;
    byAgent[name].total_cap_cents += issue.cost_cap_cents || 0;
    if (issue.status === "done" || issue.status === "cancelled") {
      byAgent[name].done += 1;
    } else {
      byAgent[name].active += 1;
    }
  }

  const byProduct: Record<string, { name: string; tasks: number; cap_cents: number }> = {};
  for (const issue of agentIssues) {
    const pid = issue.product_id;
    if (!byProduct[pid]) {
      byProduct[pid] = { name: productMap[pid]?.name || pid, tasks: 0, cap_cents: 0 };
    }
    byProduct[pid].tasks += 1;
    byProduct[pid].cap_cents += issue.cost_cap_cents || 0;
  }

  return NextResponse.json({
    summary: {
      total_agent_tasks: agentIssues.length,
      total_cap_cents: agentIssues.reduce((acc, i) => acc + (i.cost_cap_cents || 0), 0),
      active: agentIssues.filter((i) => i.status !== "done" && i.status !== "cancelled").length,
    },
    by_agent: byAgent,
    by_product: Object.values(byProduct),
  });
}
