import { NextRequest, NextResponse } from "next/server";
import { listPolicies, getPolicy, createPolicy, updatePolicy, recordCleanup, deletePolicy, retentionSummary } from "@/lib/data-retention";
import type { RetentionCategory, RetentionStatus } from "@/lib/data-retention";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const p = getPolicy(id);
    return p ? NextResponse.json(p) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("summary") !== null) return NextResponse.json(retentionSummary());
  const category = req.nextUrl.searchParams.get("category") as RetentionCategory | undefined;
  const status = req.nextUrl.searchParams.get("status") as RetentionStatus | undefined;
  return NextResponse.json(listPolicies(category || undefined, status || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deletePolicy(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const p = updatePolicy(body.id, body.updates);
    return p ? NextResponse.json(p) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "cleanup") {
    const p = recordCleanup(body.id, body.records_removed, body.bytes_freed);
    return p ? NextResponse.json(p) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const p = createPolicy(body.name, body.category, body.retention_days, body.auto_delete || false, body.description);
  return NextResponse.json(p, { status: 201 });
}
