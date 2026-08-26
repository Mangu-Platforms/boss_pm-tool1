import { NextResponse } from "next/server";
import { listServices, updateServiceStatus, listIncidents, createIncident, addIncidentUpdate, resolveIncident, overallStatus } from "@/lib/status-page";
import type { ServiceStatus, Incident } from "@/lib/status-page";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const view = url.searchParams.get("view");
  const serviceId = url.searchParams.get("service_id");

  if (view === "incidents") {
    return NextResponse.json({ incidents: listIncidents(serviceId || undefined) });
  }

  return NextResponse.json({
    overall: overallStatus(),
    services: listServices(),
    incidents: listIncidents(),
  });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "update_status") {
    const validStatuses: ServiceStatus[] = ["operational", "degraded", "partial_outage", "major_outage", "maintenance"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const svc = updateServiceStatus(body.service_id, body.status);
    return svc
      ? NextResponse.json({ service: svc })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "create_incident") {
    if (!body.title?.trim() || !body.service_id) {
      return NextResponse.json({ error: "title and service_id required" }, { status: 400 });
    }
    const validSeverities: Incident["severity"][] = ["minor", "major", "critical"];
    const severity = validSeverities.includes(body.severity) ? body.severity : "minor";
    const inc = createIncident(body.title, body.service_id, severity);
    return NextResponse.json({ incident: inc }, { status: 201 });
  }

  if (body.action === "update_incident") {
    const inc = addIncidentUpdate(body.incident_id, body.message || "");
    return inc
      ? NextResponse.json({ incident: inc })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "resolve_incident") {
    const inc = resolveIncident(body.incident_id);
    return inc
      ? NextResponse.json({ incident: inc })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
