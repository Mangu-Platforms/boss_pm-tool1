import { NextResponse } from "next/server";
import { listEstimates, getEstimate, createEstimate, updateEstimate, deleteEstimate, totalEstimate, averageEstimate } from "@/lib/estimates";
import type { EstimateUnit } from "@/lib/estimates";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const issueId = url.searchParams.get("issue_id");
  const view = url.searchParams.get("view");
  const unit = url.searchParams.get("unit") as EstimateUnit | null;

  if (id) {
    const est = getEstimate(id);
    return est ? NextResponse.json({ estimate: est }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (view === "summary") {
    return NextResponse.json({
      total: totalEstimate(unit || undefined),
      average: averageEstimate(unit || undefined),
    });
  }

  return NextResponse.json({ estimates: listEstimates(issueId || undefined) });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteEstimate(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "update") {
    const est = updateEstimate(body.id, Number(body.value));
    return est ? NextResponse.json({ estimate: est }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.issue_id || body.value == null || !body.estimated_by) {
    return NextResponse.json({ error: "issue_id, value, and estimated_by required" }, { status: 400 });
  }

  const validUnits: EstimateUnit[] = ["points", "hours", "days"];
  const unit = validUnits.includes(body.unit) ? body.unit : "points";
  const est = createEstimate(body.issue_id, Number(body.value), unit, body.estimated_by);
  return NextResponse.json({ estimate: est }, { status: 201 });
}
