import { NextRequest, NextResponse } from "next/server";
import { listBudgets, getBudget, createBudget, recordBurn, budgetBurnEvents, deleteBudget, budgetSummary } from "@/lib/error-budgets";
import type { BudgetStatus, BudgetPeriod } from "@/lib/error-budgets";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const b = getBudget(id);
    return b ? NextResponse.json(b) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("summary") !== null) return NextResponse.json(budgetSummary());
  const eventsFor = req.nextUrl.searchParams.get("events");
  if (eventsFor) return NextResponse.json(budgetBurnEvents(eventsFor));
  const service_id = req.nextUrl.searchParams.get("service_id") || undefined;
  const status = req.nextUrl.searchParams.get("status") as BudgetStatus | undefined;
  return NextResponse.json(listBudgets(service_id, status || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteBudget(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "burn") {
    const event = recordBurn(body.budget_id, body.minutes, body.reason);
    return event ? NextResponse.json(event) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const b = createBudget(body.service_id, body.metric, body.slo_target, body.period as BudgetPeriod, body.period_start, body.period_end);
  return NextResponse.json(b, { status: 201 });
}
