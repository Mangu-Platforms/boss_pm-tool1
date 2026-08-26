import { NextResponse } from "next/server";
import { listIntegrations, updateIntegrationStatus } from "@/lib/integrations";
import type { IntegrationStatus } from "@/lib/integrations";

export async function GET() {
  return NextResponse.json({ integrations: listIntegrations() });
}

export async function PATCH(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }
  const integration = updateIntegrationStatus(body.id, body.status as IntegrationStatus, body.config);
  if (!integration) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ integration });
}
