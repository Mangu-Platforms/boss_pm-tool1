import { NextRequest, NextResponse } from "next/server";
import { listWatchers, watchersForUser, isWatching, watchIssue, unwatchIssue, watcherCount } from "@/lib/issue-watchers";
import type { WatchReason } from "@/lib/issue-watchers";

export async function GET(req: NextRequest) {
  const issueId = req.nextUrl.searchParams.get("issue_id");
  const userId = req.nextUrl.searchParams.get("user_id");
  if (req.nextUrl.searchParams.get("count") !== null && issueId) {
    return NextResponse.json({ issue_id: issueId, count: watcherCount(issueId) });
  }
  if (req.nextUrl.searchParams.get("is_watching") !== null && issueId && userId) {
    return NextResponse.json({ watching: isWatching(issueId, userId) });
  }
  if (userId) return NextResponse.json(watchersForUser(userId));
  if (issueId) return NextResponse.json(listWatchers(issueId));
  return NextResponse.json({ error: "issue_id or user_id required" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "unwatch") {
    return unwatchIssue(body.issue_id, body.user_id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not watching" }, { status: 404 });
  }
  const w = watchIssue(body.issue_id, body.user_id, (body.reason || "manual") as WatchReason);
  return NextResponse.json(w, { status: 201 });
}
