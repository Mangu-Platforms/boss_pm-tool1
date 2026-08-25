import { NextResponse } from "next/server";
import { listProducts, listIssues, listLinks } from "@/lib/store";

export async function GET() {
  const products = listProducts();
  const issues = listIssues();
  const links = listLinks();

  const cashEngineProducts = products.filter((p) => p.engine_tag === "cash-engine");
  const labProducts = products.filter((p) => p.engine_tag === "lab");
  const openIssues = issues.filter((i) => i.status === "open" || i.status === "doing");
  const agentIssues = issues.filter((i) => i.assignee_kind === "agent");
  const totalCapCents = agentIssues.reduce((acc, i) => acc + (i.cost_cap_cents || 0), 0);

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
    },
    github_links: links.length,
  });
}
