import { NextResponse } from "next/server";
import { listApprovals, getApproval, requestApproval, decideApproval, deleteApproval, pendingForUser } from "@/lib/approvals";
import type { ApprovalStatus } from "@/lib/approvals";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const status = url.searchParams.get("status") as ApprovalStatus | null;
  const pendingFor = url.searchParams.get("pending_for");

  if (pendingFor) {
    return NextResponse.json({ approvals: pendingForUser(pendingFor) });
  }

  if (id) {
    const a = getApproval(id);
    if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ approval: a });
  }

  return NextResponse.json({ approvals: listApprovals(status || undefined) });
}

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteApproval(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "decide") {
    if (!["approved", "rejected"].includes(body.decision)) {
      return NextResponse.json({ error: "decision must be approved or rejected" }, { status: 400 });
    }
    const a = decideApproval(body.id, body.decision, body.decided_by || "max", body.notes || "");
    return a ? NextResponse.json({ approval: a }) : NextResponse.json({ error: "Cannot decide" }, { status: 400 });
  }

  if (!body.title?.trim() || !body.entity_type || !body.entity_id) {
    return NextResponse.json({ error: "title, entity_type, and entity_id required" }, { status: 400 });
  }

  const a = requestApproval(body.entity_type, body.entity_id, body.title, body.requested_by || "max", body.approvers || []);
  return NextResponse.json({ approval: a }, { status: 201 });
}
