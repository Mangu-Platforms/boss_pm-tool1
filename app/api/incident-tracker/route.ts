import { NextRequest, NextResponse } from "next/server";
import { listIncidents, getIncident, createIncident, updateIncidentStatus, addIncidentUpdate, incidentMetrics } from "@/lib/incident-tracker";
import type { IncidentSeverity, IncidentStatus } from "@/lib/incident-tracker";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const inc = getIncident(id);
    return inc ? NextResponse.json(inc) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("metrics") !== null) {
    return NextResponse.json(incidentMetrics());
  }
  const status = req.nextUrl.searchParams.get("status") as IncidentStatus | undefined;
  return NextResponse.json(listIncidents(status || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "update_status") {
    const inc = updateIncidentStatus(body.id, body.status as IncidentStatus);
    return inc ? NextResponse.json(inc) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "add_update") {
    const inc = addIncidentUpdate(body.id, body.message, body.author || "max");
    return inc ? NextResponse.json(inc) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const inc = createIncident(body.title, body.description, body.severity as IncidentSeverity, body.service_ids || [], body.commander || "max");
  return NextResponse.json(inc, { status: 201 });
}
