import { NextRequest, NextResponse } from "next/server";
import { getHistory, addHistoryEvent, recentHistory, historyByActor, historyStats } from "@/lib/issue-history";
import type { HistoryEventType } from "@/lib/issue-history";

export async function GET(req: NextRequest) {
  const issueId = req.nextUrl.searchParams.get("issue_id");
  if (issueId) {
    const stats = req.nextUrl.searchParams.get("stats");
    if (stats === "true") return NextResponse.json(historyStats(issueId));
    return NextResponse.json(getHistory(issueId));
  }
  const actor = req.nextUrl.searchParams.get("actor");
  if (actor) return NextResponse.json(historyByActor(actor));
  const limit = Number(req.nextUrl.searchParams.get("limit") || 20);
  return NextResponse.json(recentHistory(limit));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const event = addHistoryEvent(body.issue_id, body.type as HistoryEventType, body.actor, body.old_value || null, body.new_value || null);
  return NextResponse.json(event, { status: 201 });
}
