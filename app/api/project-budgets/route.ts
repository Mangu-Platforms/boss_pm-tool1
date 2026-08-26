import { NextRequest, NextResponse } from "next/server";
import { listBudgets, getBudget, createBudget, addLineItem, recordExpense, deleteBudget, budgetSummary } from "@/lib/project-budgets";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const b = getBudget(id);
    return b ? NextResponse.json(b) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("summary") !== null) {
    return NextResponse.json(budgetSummary());
  }
  const projectId = req.nextUrl.searchParams.get("project_id");
  return NextResponse.json(listBudgets(projectId || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteBudget(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "add_line_item") {
    const item = addLineItem(body.budget_id, body.category, body.planned);
    return item ? NextResponse.json(item, { status: 201 }) : NextResponse.json({ error: "budget not found" }, { status: 404 });
  }
  if (body.action === "record_expense") {
    return recordExpense(body.budget_id, body.line_item_id, body.amount)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const b = createBudget(body.project_id, body.name, body.total_budget);
  return NextResponse.json(b, { status: 201 });
}
