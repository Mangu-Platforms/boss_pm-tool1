import { NextResponse } from "next/server";
import { listCostEntries, getCostEntry, createCostEntry, deleteCostEntry, costSummary } from "@/lib/cost-tracking";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const issueId = url.searchParams.get("issue_id");
  const view = url.searchParams.get("view");

  if (view === "summary") {
    return NextResponse.json({ summary: costSummary(issueId || undefined) });
  }

  if (id) {
    const entry = getCostEntry(id);
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ entry });
  }

  return NextResponse.json({ entries: listCostEntries(issueId || undefined) });
}

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteCostEntry(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.issue_id?.trim() || !body.amount_cents) {
    return NextResponse.json({ error: "issue_id and amount_cents required" }, { status: 400 });
  }

  const entry = createCostEntry(body.issue_id, body.category || "other", body.amount_cents, body.description || "", body.recorded_by || "max");
  return NextResponse.json({ entry }, { status: 201 });
}
