import { NextRequest, NextResponse } from "next/server";
import { listAuditEntries, getAuditEntry, createAuditEntry, auditStats } from "@/lib/audit-trails";
import type { AuditAction, AuditResource } from "@/lib/audit-trails";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const e = getAuditEntry(id);
    return e ? NextResponse.json(e) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("stats") !== null) return NextResponse.json(auditStats());
  const actor = req.nextUrl.searchParams.get("actor") || undefined;
  const action = req.nextUrl.searchParams.get("action") as AuditAction | undefined;
  const resource_type = req.nextUrl.searchParams.get("resource_type") as AuditResource | undefined;
  const limit = req.nextUrl.searchParams.get("limit");
  return NextResponse.json(listAuditEntries(actor, action || undefined, resource_type || undefined, limit ? parseInt(limit) : undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const e = createAuditEntry(body.actor, body.action, body.resource_type, body.resource_id, body.details, body.ip_address, body.user_agent);
  return NextResponse.json(e, { status: 201 });
}
