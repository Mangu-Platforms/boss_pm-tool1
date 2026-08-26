import { NextRequest, NextResponse } from "next/server";
import { listTechDebt, getTechDebt, createTechDebt, updateTechDebt, deleteTechDebt, techDebtStats } from "@/lib/tech-debt";
import type { DebtCategory, DebtStatus, DebtPriority } from "@/lib/tech-debt";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const d = getTechDebt(id);
    return d ? NextResponse.json(d) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("stats") !== null) return NextResponse.json(techDebtStats());
  const category = req.nextUrl.searchParams.get("category") as DebtCategory | undefined;
  const status = req.nextUrl.searchParams.get("status") as DebtStatus | undefined;
  const priority = req.nextUrl.searchParams.get("priority") as DebtPriority | undefined;
  return NextResponse.json(listTechDebt(category || undefined, status || undefined, priority || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteTechDebt(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const d = updateTechDebt(body.id, body.updates);
    return d ? NextResponse.json(d) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const d = createTechDebt(body.title, body.description, body.category, body.priority, body.effort_days, body.impact_score, body.service_id, body.owner);
  return NextResponse.json(d, { status: 201 });
}
