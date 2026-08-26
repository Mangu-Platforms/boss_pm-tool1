import { NextResponse } from "next/server";
import { listAuditLog, auditCount } from "@/lib/audit-log";
import type { AuditAction } from "@/lib/audit-log";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const actor = searchParams.get("actor") || undefined;
  const action = (searchParams.get("action") as AuditAction) || undefined;
  const resourceType = searchParams.get("resource_type") || undefined;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;

  const entries = listAuditLog({ actor, action, resource_type: resourceType, limit });
  return NextResponse.json({ entries, total: auditCount() });
}
