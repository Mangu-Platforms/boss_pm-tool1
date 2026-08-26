import { NextRequest, NextResponse } from "next/server";
import { listExperiments, getExperiment, createExperiment, updateExperiment, recordImpression, experimentResults, deleteExperiment } from "@/lib/ab-testing";
import type { ExperimentStatus } from "@/lib/ab-testing";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const exp = getExperiment(id);
    return exp ? NextResponse.json(exp) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const resultsId = req.nextUrl.searchParams.get("results");
  if (resultsId) {
    const r = experimentResults(resultsId);
    return r ? NextResponse.json(r) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const status = req.nextUrl.searchParams.get("status") as ExperimentStatus | undefined;
  return NextResponse.json(listExperiments(status || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteExperiment(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const exp = updateExperiment(body.id, body.updates);
    return exp ? NextResponse.json(exp) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "record") {
    const exp = recordImpression(body.id, body.variant_id, body.converted || false);
    return exp ? NextResponse.json(exp) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const exp = createExperiment(body.name, body.hypothesis, body.metric, body.owner || "max");
  return NextResponse.json(exp, { status: 201 });
}
