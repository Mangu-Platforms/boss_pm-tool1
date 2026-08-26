import { NextRequest, NextResponse } from "next/server";
import { listWorkstreams, getWorkstream, createWorkstream, updateWorkstream, addIssueToWorkstream, removeIssueFromWorkstream, deleteWorkstream, workstreamStats } from "@/lib/workstreams";
import type { WorkstreamStatus, WorkstreamPriority } from "@/lib/workstreams";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const ws = getWorkstream(id);
    return ws ? NextResponse.json(ws) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("stats") !== null) {
    return NextResponse.json(workstreamStats());
  }
  const status = req.nextUrl.searchParams.get("status") as WorkstreamStatus | undefined;
  return NextResponse.json(listWorkstreams(status || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteWorkstream(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const ws = updateWorkstream(body.id, body.updates);
    return ws ? NextResponse.json(ws) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "add_issue") {
    const ws = addIssueToWorkstream(body.id, body.issue_id);
    return ws ? NextResponse.json(ws) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "remove_issue") {
    const ws = removeIssueFromWorkstream(body.id, body.issue_id);
    return ws ? NextResponse.json(ws) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const ws = createWorkstream(body.name, body.description, body.priority as WorkstreamPriority, body.owner || "max", body.product_id || "boss-pm", body.start_date, body.target_date);
  return NextResponse.json(ws, { status: 201 });
}
