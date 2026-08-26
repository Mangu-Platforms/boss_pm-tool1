import { NextResponse } from "next/server";
import { listRisks, getRisk, createRisk, updateRisk, deleteRisk, riskMatrix } from "@/lib/risks";
import type { RiskLevel } from "@/lib/risks";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const view = url.searchParams.get("view");

  if (view === "matrix") {
    return NextResponse.json({ matrix: riskMatrix(), total: listRisks().length });
  }

  if (id) {
    const risk = getRisk(id);
    return risk
      ? NextResponse.json({ risk })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ risks: listRisks() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "update") {
    const updated = updateRisk(body.id, {
      title: body.title,
      description: body.description,
      likelihood: body.likelihood,
      impact: body.impact,
      status: body.status,
      owner: body.owner,
      mitigation: body.mitigation,
    });
    return updated
      ? NextResponse.json({ risk: updated })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "delete") {
    return deleteRisk(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const validLevels: RiskLevel[] = ["critical", "high", "medium", "low"];
  const likelihood = validLevels.includes(body.likelihood) ? body.likelihood : "medium";
  const impact = validLevels.includes(body.impact) ? body.impact : "medium";

  const risk = createRisk(body.title, body.description || "", likelihood, impact, body.owner, body.mitigation);
  return NextResponse.json({ risk }, { status: 201 });
}
