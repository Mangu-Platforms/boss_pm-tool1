import { NextRequest, NextResponse } from "next/server";
import { listDeployments, getDeployment, createDeployment, updateDeployment, deploymentMetrics } from "@/lib/deployment-tracking";
import type { DeploymentEnvironment } from "@/lib/deployment-tracking";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const dep = getDeployment(id);
    return dep ? NextResponse.json(dep) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("metrics") !== null) {
    const env = req.nextUrl.searchParams.get("env") as DeploymentEnvironment | undefined;
    return NextResponse.json(deploymentMetrics(env || undefined));
  }
  const serviceId = req.nextUrl.searchParams.get("service_id") || undefined;
  const env = req.nextUrl.searchParams.get("env") as DeploymentEnvironment | undefined;
  return NextResponse.json(listDeployments(serviceId, env || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "update") {
    const dep = updateDeployment(body.id, body.updates);
    return dep ? NextResponse.json(dep) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const dep = createDeployment(body.service_id, body.version, body.environment as DeploymentEnvironment, body.deployer || "max", body.commit_sha || "");
  return NextResponse.json(dep, { status: 201 });
}
