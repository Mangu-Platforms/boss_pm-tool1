import { NextRequest, NextResponse } from "next/server";
import { listEndpoints, getEndpoint, createEndpoint, recordCheck, endpointChecks, deleteEndpoint, apiHealthSummary } from "@/lib/api-health";
import type { HealthStatus, HttpMethod } from "@/lib/api-health";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const ep = getEndpoint(id);
    return ep ? NextResponse.json(ep) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("summary") !== null) return NextResponse.json(apiHealthSummary());
  const checksFor = req.nextUrl.searchParams.get("checks");
  if (checksFor) return NextResponse.json(endpointChecks(checksFor));
  const service_id = req.nextUrl.searchParams.get("service_id") || undefined;
  const status = req.nextUrl.searchParams.get("status") as HealthStatus | undefined;
  return NextResponse.json(listEndpoints(service_id, status || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteEndpoint(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "check") {
    const check = recordCheck(body.endpoint_id, body.status_code, body.response_time_ms);
    return check ? NextResponse.json(check) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const ep = createEndpoint(body.service_id, body.method as HttpMethod, body.path);
  return NextResponse.json(ep, { status: 201 });
}
