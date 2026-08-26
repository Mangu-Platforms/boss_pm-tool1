import { NextRequest, NextResponse } from "next/server";
import { mentionsForIssue, mentionsByUser, addMention, mentionCount, recentMentions, mentionsByContext } from "@/lib/issue-mentions";
import type { MentionContext } from "@/lib/issue-mentions";

export async function GET(req: NextRequest) {
  const issueId = req.nextUrl.searchParams.get("issue_id");
  const userId = req.nextUrl.searchParams.get("user_id");
  const context = req.nextUrl.searchParams.get("context");
  if (req.nextUrl.searchParams.get("recent") !== null) {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
    return NextResponse.json(recentMentions(limit));
  }
  if (req.nextUrl.searchParams.get("count") !== null && issueId) {
    return NextResponse.json({ issue_id: issueId, count: mentionCount(issueId) });
  }
  if (context) return NextResponse.json(mentionsByContext(context as MentionContext));
  if (userId) return NextResponse.json(mentionsByUser(userId));
  if (issueId) return NextResponse.json(mentionsForIssue(issueId));
  return NextResponse.json({ error: "issue_id or user_id required" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const m = addMention(body.issue_id, body.mentioned_by, body.context as MentionContext, body.source_id, body.snippet);
  return NextResponse.json(m, { status: 201 });
}
