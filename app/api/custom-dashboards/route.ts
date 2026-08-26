import { NextRequest, NextResponse } from "next/server";
import { listDashboards, getDashboard, getDefaultDashboard, createDashboard, updateDashboard, addWidget, removeWidget, deleteDashboard } from "@/lib/custom-dashboards";
import type { WidgetType } from "@/lib/custom-dashboards";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const d = getDashboard(id);
    return d ? NextResponse.json(d) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("default") !== null) {
    const d = getDefaultDashboard();
    return d ? NextResponse.json(d) : NextResponse.json({ error: "no default" }, { status: 404 });
  }
  const owner = req.nextUrl.searchParams.get("owner");
  return NextResponse.json(listDashboards(owner || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteDashboard(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const d = updateDashboard(body.id, body.updates);
    return d ? NextResponse.json(d) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "add_widget") {
    const w = addWidget(body.dashboard_id, body.type as WidgetType, body.title, body.config || {});
    return w ? NextResponse.json(w, { status: 201 }) : NextResponse.json({ error: "dashboard not found" }, { status: 404 });
  }
  if (body.action === "remove_widget") {
    return removeWidget(body.dashboard_id, body.widget_id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const d = createDashboard(body.name, body.description || "", body.owner || "max");
  return NextResponse.json(d, { status: 201 });
}
