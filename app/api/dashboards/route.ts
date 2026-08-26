import { NextResponse } from "next/server";
import { listDashboards, getDashboard, createDashboard, addWidget, removeWidget, deleteDashboard, getDefaultDashboard } from "@/lib/dashboards";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const owner = url.searchParams.get("owner");
  const getDefault = url.searchParams.get("default");

  if (getDefault && owner) {
    const d = getDefaultDashboard(owner);
    return d ? NextResponse.json({ dashboard: d }) : NextResponse.json({ error: "No default" }, { status: 404 });
  }

  if (id) {
    const d = getDashboard(id);
    if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ dashboard: d });
  }

  return NextResponse.json({ dashboards: listDashboards(owner || undefined) });
}

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteDashboard(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "add_widget") {
    const d = addWidget(body.dashboard_id, body.type, body.title, body.config || {}, body.position || { x: 0, y: 0, w: 3, h: 2 });
    return d ? NextResponse.json({ dashboard: d }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "remove_widget") {
    const d = removeWidget(body.dashboard_id, body.widget_id);
    return d ? NextResponse.json({ dashboard: d }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const d = createDashboard(body.name, body.owner || "max");
  return NextResponse.json({ dashboard: d }, { status: 201 });
}
