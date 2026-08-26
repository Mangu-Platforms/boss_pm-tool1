import { NextRequest, NextResponse } from "next/server";
import { listForecasts, getForecast, createForecast, updateForecast, deleteForecast, teamSummary } from "@/lib/capacity-forecasting";
import type { ForecastPeriod, ForecastStatus } from "@/lib/capacity-forecasting";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const f = getForecast(id);
    return f ? NextResponse.json(f) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const summaryTeam = req.nextUrl.searchParams.get("summary");
  if (summaryTeam) return NextResponse.json(teamSummary(summaryTeam));
  const team = req.nextUrl.searchParams.get("team") || undefined;
  const period = req.nextUrl.searchParams.get("period") as ForecastPeriod | undefined;
  const status = req.nextUrl.searchParams.get("status") as ForecastStatus | undefined;
  return NextResponse.json(listForecasts(team, period || undefined, status || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteForecast(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const f = updateForecast(body.id, body.updates);
    return f ? NextResponse.json(f) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const f = createForecast(body.team, body.period, body.period_label, body.available_hours, body.planned_hours, body.notes);
  return NextResponse.json(f, { status: 201 });
}
