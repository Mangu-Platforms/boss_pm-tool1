import { NextRequest, NextResponse } from "next/server";
import { listControls, getControl, createControl, updateControl, deleteControl, complianceSummary, overdueControls } from "@/lib/compliance-tracker";
import type { ComplianceFramework, ComplianceStatus } from "@/lib/compliance-tracker";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const ctrl = getControl(id);
    return ctrl ? NextResponse.json(ctrl) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("summary") !== null) {
    const fw = req.nextUrl.searchParams.get("framework") as ComplianceFramework | undefined;
    return NextResponse.json(complianceSummary(fw || undefined));
  }
  if (req.nextUrl.searchParams.get("overdue") !== null) {
    return NextResponse.json(overdueControls());
  }
  const fw = req.nextUrl.searchParams.get("framework") as ComplianceFramework | undefined;
  const status = req.nextUrl.searchParams.get("status") as ComplianceStatus | undefined;
  return NextResponse.json(listControls(fw || undefined, status || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteControl(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const ctrl = updateControl(body.id, body.updates);
    return ctrl ? NextResponse.json(ctrl) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const ctrl = createControl(body.framework as ComplianceFramework, body.control_id, body.title, body.description || "", body.owner || "max", body.next_review);
  return NextResponse.json(ctrl, { status: 201 });
}
