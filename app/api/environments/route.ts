import { NextResponse } from "next/server";
import { listEnvironments, getEnvironment, createEnvironment, updateEnvironmentStatus, deleteEnvironment } from "@/lib/environments";
import type { EnvStatus } from "@/lib/environments";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const env = getEnvironment(id);
    return env ? NextResponse.json({ environment: env }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ environments: listEnvironments() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteEnvironment(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "update_status") {
    const validStatuses: EnvStatus[] = ["active", "inactive", "deploying", "failed"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const env = updateEnvironmentStatus(body.id, body.status);
    return env ? NextResponse.json({ environment: env }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.name?.trim() || !body.url?.trim() || !body.branch?.trim()) {
    return NextResponse.json({ error: "name, url, and branch required" }, { status: 400 });
  }

  const env = createEnvironment(body.name.trim(), body.url.trim(), body.branch.trim());
  return NextResponse.json({ environment: env }, { status: 201 });
}
