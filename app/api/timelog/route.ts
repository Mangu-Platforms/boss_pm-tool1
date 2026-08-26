import { NextResponse } from "next/server";
import { allTimeEntries, logTime, totalMinutes } from "@/lib/timelog";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const issueId = url.searchParams.get("issue_id");
  const entries = allTimeEntries();
  const filtered = issueId ? entries.filter((e) => e.issue_id === issueId) : entries;

  const byIssue: Record<string, number> = {};
  for (const e of filtered) {
    byIssue[e.issue_id] = (byIssue[e.issue_id] || 0) + e.minutes;
  }

  return NextResponse.json({
    entries: filtered,
    total_minutes: filtered.reduce((s, e) => s + e.minutes, 0),
    by_issue: byIssue,
  });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.issue_id) {
    return NextResponse.json({ error: "issue_id required" }, { status: 400 });
  }

  const minutes = Number(body.minutes);
  if (!minutes || minutes <= 0) {
    return NextResponse.json({ error: "minutes must be a positive number" }, { status: 400 });
  }

  const entry = logTime(body.issue_id, minutes, body.note || "", body.author);
  return NextResponse.json({ entry }, { status: 201 });
}
