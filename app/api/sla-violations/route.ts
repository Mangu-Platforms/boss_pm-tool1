import { NextRequest, NextResponse } from "next/server";
import { listViolations, getViolation, createViolation, updateViolation, violationStats } from "@/lib/sla-violations";
import type { ViolationStatus, ViolationSeverity } from "@/lib/sla-violations";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const v = getViolation(id);
    return v ? NextResponse.json(v) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("stats") !== null) return NextResponse.json(violationStats());
  const status = req.nextUrl.searchParams.get("status") as ViolationStatus | undefined;
  const serviceId = req.nextUrl.searchParams.get("service_id") || undefined;
  return NextResponse.json(listViolations(status || undefined, serviceId));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "update") {
    const v = updateViolation(body.id, body.updates);
    return v ? NextResponse.json(v) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const v = createViolation(body.service_id, body.sla_metric, body.threshold, body.actual_value, body.severity as ViolationSeverity, body.impact_description || "");
  return NextResponse.json(v, { status: 201 });
}
