import { NextRequest, NextResponse } from "next/server";
import { listCosts, getCost, createCost, deleteCost, costSummary } from "@/lib/cost-allocation";
import type { CostCategory, AllocationPeriod } from "@/lib/cost-allocation";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const c = getCost(id);
    return c ? NextResponse.json(c) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("summary") !== null) {
    const pl = req.nextUrl.searchParams.get("period_label") || undefined;
    return NextResponse.json(costSummary(pl));
  }
  const service_id = req.nextUrl.searchParams.get("service_id") || undefined;
  const team = req.nextUrl.searchParams.get("team") || undefined;
  const category = req.nextUrl.searchParams.get("category") as CostCategory | undefined;
  const period_label = req.nextUrl.searchParams.get("period_label") || undefined;
  return NextResponse.json(listCosts(service_id, team, category || undefined, period_label));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteCost(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const c = createCost(body.service_id, body.team, body.category as CostCategory, body.amount_cents, body.period as AllocationPeriod, body.period_label, body.description);
  return NextResponse.json(c, { status: 201 });
}
