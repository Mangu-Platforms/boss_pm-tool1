import { NextRequest, NextResponse } from "next/server";
import { impactForChangeRequest, addImpactItem, removeImpactItem, impactReport, highRiskItems } from "@/lib/impact-analysis";
import type { ImpactArea, ImpactSeverity } from "@/lib/impact-analysis";

export async function GET(req: NextRequest) {
  const crId = req.nextUrl.searchParams.get("change_request_id");
  if (req.nextUrl.searchParams.get("high_risk") !== null) {
    return NextResponse.json(highRiskItems());
  }
  if (req.nextUrl.searchParams.get("report") !== null && crId) {
    return NextResponse.json(impactReport(crId));
  }
  if (crId) {
    return NextResponse.json(impactForChangeRequest(crId));
  }
  return NextResponse.json({ error: "change_request_id required" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "remove") {
    return removeImpactItem(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const item = addImpactItem(body.change_request_id, body.area as ImpactArea, body.severity as ImpactSeverity, body.description, body.mitigation, body.affected_users || 0, body.effort_hours || 0);
  return NextResponse.json(item, { status: 201 });
}
