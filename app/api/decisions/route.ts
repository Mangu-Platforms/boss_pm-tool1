import { NextResponse } from "next/server";
import { listDecisions, getDecision, createDecision, updateDecisionStatus, updateDecision, deleteDecision } from "@/lib/decisions";
import type { DecisionStatus } from "@/lib/decisions";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const d = getDecision(id);
    return d
      ? NextResponse.json({ decision: d })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ decisions: listDecisions() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "update_status") {
    const validStatuses: DecisionStatus[] = ["proposed", "accepted", "rejected", "superseded"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const d = updateDecisionStatus(body.id, body.status);
    return d
      ? NextResponse.json({ decision: d })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "update") {
    const d = updateDecision(body.id, {
      title: body.title,
      context: body.context,
      decision: body.decision,
      consequences: body.consequences,
      participants: body.participants,
    });
    return d
      ? NextResponse.json({ decision: d })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "delete") {
    return deleteDecision(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const d = createDecision(body.title, body.context || "", body.decision || "", body.consequences || "", body.author, body.participants);
  return NextResponse.json({ decision: d }, { status: 201 });
}
