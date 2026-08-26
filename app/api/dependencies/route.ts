import { NextResponse } from "next/server";
import { addDependency, removeDependency, getDependencies, getBlockers, getBlocking, getDependencyGraph, detectCycle, listAllDependencies } from "@/lib/dependencies";
import type { DependencyType } from "@/lib/dependencies";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const issueId = url.searchParams.get("issue_id");
  const view = url.searchParams.get("view");

  if (view === "graph") {
    return NextResponse.json(getDependencyGraph());
  }

  if (!issueId) {
    return NextResponse.json({ dependencies: listAllDependencies() });
  }

  return NextResponse.json({
    dependencies: getDependencies(issueId),
    blockers: getBlockers(issueId),
    blocking: getBlocking(issueId),
  });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "remove") {
    return removeDependency(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.source_id || !body.target_id || !body.type) {
    return NextResponse.json({ error: "source_id, target_id, and type required" }, { status: 400 });
  }

  const validTypes: DependencyType[] = ["blocks", "blocked_by", "relates_to", "duplicates"];
  if (!validTypes.includes(body.type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (body.source_id === body.target_id) {
    return NextResponse.json({ error: "Cannot depend on self" }, { status: 400 });
  }

  if ((body.type === "blocks" || body.type === "blocked_by") && detectCycle(body.source_id, body.target_id)) {
    return NextResponse.json({ error: "Circular dependency detected" }, { status: 400 });
  }

  const dep = addDependency(body.source_id, body.target_id, body.type);
  return NextResponse.json({ dependency: dep }, { status: 201 });
}
