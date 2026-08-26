import { NextRequest, NextResponse } from "next/server";
import { listFindings, getFinding, createFinding, updateFinding, deleteFinding, securityStats } from "@/lib/security-scanning";
import type { ScanType, FindingSeverity, FindingStatus } from "@/lib/security-scanning";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const f = getFinding(id);
    return f ? NextResponse.json(f) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("stats") !== null) return NextResponse.json(securityStats());
  const scan_type = req.nextUrl.searchParams.get("scan_type") as ScanType | undefined;
  const severity = req.nextUrl.searchParams.get("severity") as FindingSeverity | undefined;
  const status = req.nextUrl.searchParams.get("status") as FindingStatus | undefined;
  const service_id = req.nextUrl.searchParams.get("service_id") || undefined;
  return NextResponse.json(listFindings(scan_type || undefined, severity || undefined, status || undefined, service_id));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteFinding(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const f = updateFinding(body.id, body.updates);
    return f ? NextResponse.json(f) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const f = createFinding(body.scan_type, body.service_id, body.title, body.description, body.severity, body.remediation, body.cve_id, body.file_path, body.line_number);
  return NextResponse.json(f, { status: 201 });
}
