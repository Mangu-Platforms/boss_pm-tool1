import { NextRequest, NextResponse } from "next/server";
import { listServices, getService, createService, updateService, addDependency, deleteService, dependencyGraph } from "@/lib/service-catalog";
import type { ServiceTier } from "@/lib/service-catalog";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const svc = getService(id);
    return svc ? NextResponse.json(svc) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("graph") !== null) {
    return NextResponse.json(dependencyGraph());
  }
  const tier = req.nextUrl.searchParams.get("tier") as ServiceTier | undefined;
  return NextResponse.json(listServices(tier || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteService(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const svc = updateService(body.id, body.updates);
    return svc ? NextResponse.json(svc) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "add_dependency") {
    const svc = addDependency(body.id, body.dep_id);
    return svc ? NextResponse.json(svc) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const svc = createService(body.name, body.description, body.tier as ServiceTier, body.owner || "max", body.team || "platform", body.sla_uptime || 99.9);
  return NextResponse.json(svc, { status: 201 });
}
