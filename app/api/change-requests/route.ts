import { NextRequest, NextResponse } from "next/server";
import { listChangeRequests, getChangeRequest, createChangeRequest, updateChangeRequest, deleteChangeRequest, changeRequestStats } from "@/lib/change-requests";
import type { ChangeRequestStatus, ChangeCategory, ChangeRequestPriority } from "@/lib/change-requests";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const cr = getChangeRequest(id);
    return cr ? NextResponse.json(cr) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("stats") !== null) {
    return NextResponse.json(changeRequestStats());
  }
  const status = req.nextUrl.searchParams.get("status") as ChangeRequestStatus | undefined;
  return NextResponse.json(listChangeRequests(status || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteChangeRequest(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const cr = updateChangeRequest(body.id, body.updates);
    return cr ? NextResponse.json(cr) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const cr = createChangeRequest(body.title, body.description, body.category as ChangeCategory, body.priority as ChangeRequestPriority, body.requester || "max", body.affected_systems || [], body.risk_level || "low", body.rollback_plan || "");
  return NextResponse.json(cr, { status: 201 });
}
