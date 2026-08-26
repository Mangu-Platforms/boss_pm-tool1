import { NextRequest, NextResponse } from "next/server";
import { listAlerts, getAlert, createAlert, evaluateAlert, acknowledgeAlert, deleteAlert } from "@/lib/metric-alerts";
import type { AlertStatus } from "@/lib/metric-alerts";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const a = getAlert(id);
    return a ? NextResponse.json(a) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const status = (req.nextUrl.searchParams.get("status") as AlertStatus) || undefined;
  return NextResponse.json(listAlerts(status));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteAlert(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "evaluate") {
    const a = evaluateAlert(body.id, body.current_value);
    return a ? NextResponse.json(a) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "acknowledge") {
    const a = acknowledgeAlert(body.id);
    return a ? NextResponse.json(a) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const a = createAlert(body.name, body.metric, body.condition, body.threshold, body.notifiers || []);
  return NextResponse.json(a, { status: 201 });
}
