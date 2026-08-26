import { NextRequest, NextResponse } from "next/server";
import { listBenchmarks, getBenchmark, createBenchmark, recordResult, deleteBenchmark, benchmarkSummary } from "@/lib/perf-benchmarks";
import type { BenchmarkType, BenchmarkStatus } from "@/lib/perf-benchmarks";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const b = getBenchmark(id);
    return b ? NextResponse.json(b) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("summary") !== null) return NextResponse.json(benchmarkSummary());
  const service_id = req.nextUrl.searchParams.get("service_id") || undefined;
  const type = req.nextUrl.searchParams.get("type") as BenchmarkType | undefined;
  const status = req.nextUrl.searchParams.get("status") as BenchmarkStatus | undefined;
  return NextResponse.json(listBenchmarks(service_id, type || undefined, status || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteBenchmark(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "record") {
    const b = recordResult(body.id, body.value);
    return b ? NextResponse.json(b) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const b = createBenchmark(body.service_id, body.name, body.type, body.baseline_value, body.threshold_value, body.unit);
  return NextResponse.json(b, { status: 201 });
}
