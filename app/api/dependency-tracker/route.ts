import { NextRequest, NextResponse } from "next/server";
import { listDependencies, getDependency, createDependency, updateDependency, deleteDependency, depStats } from "@/lib/dependency-tracker";
import type { DepType, DepStatus } from "@/lib/dependency-tracker";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const d = getDependency(id);
    return d ? NextResponse.json(d) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("stats") !== null) {
    const svc = req.nextUrl.searchParams.get("service_id") || undefined;
    return NextResponse.json(depStats(svc));
  }
  const service_id = req.nextUrl.searchParams.get("service_id") || undefined;
  const type = req.nextUrl.searchParams.get("type") as DepType | undefined;
  const status = req.nextUrl.searchParams.get("status") as DepStatus | undefined;
  return NextResponse.json(listDependencies(service_id, type || undefined, status || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteDependency(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const d = updateDependency(body.id, body.updates);
    return d ? NextResponse.json(d) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const d = createDependency(body.service_id, body.name, body.current_version, body.latest_version, body.type as DepType, body.license, body.direct !== false);
  return NextResponse.json(d, { status: 201 });
}
