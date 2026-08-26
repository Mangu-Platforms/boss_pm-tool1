import { NextResponse } from "next/server";
import { dbListIssues, dbListProducts } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "json";
  const product = url.searchParams.get("product") || undefined;

  const [issues, products] = await Promise.all([
    dbListIssues(product),
    dbListProducts(),
  ]);

  if (format === "csv") {
    const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));
    const headers = ["id", "title", "product", "status", "priority", "assignee_kind", "assignee", "cost_cap_cents", "due_on", "created_at"];
    const rows = issues.map((i) => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      productMap[i.product_id] || i.product_id,
      i.status,
      i.priority || "medium",
      i.assignee_kind,
      i.assignee_kind === "agent" ? i.agent_name : i.assignee_user,
      i.cost_cap_cents ?? "",
      i.due_on ?? "",
      i.created_at,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="boss-pm-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({
    exported_at: new Date().toISOString(),
    products,
    issues,
  });
}
