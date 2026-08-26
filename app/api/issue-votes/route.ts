import { NextRequest, NextResponse } from "next/server";
import { votesForIssue, addVote, removeVote, reactionSummary, topVotedIssues, userVotes } from "@/lib/issue-votes";
import type { ReactionType } from "@/lib/issue-votes";

export async function GET(req: NextRequest) {
  const issueId = req.nextUrl.searchParams.get("issue_id");
  const userId = req.nextUrl.searchParams.get("user_id");
  if (req.nextUrl.searchParams.get("top") !== null) {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
    return NextResponse.json(topVotedIssues(limit));
  }
  if (req.nextUrl.searchParams.get("summary") !== null && issueId) {
    return NextResponse.json(reactionSummary(issueId));
  }
  if (userId) return NextResponse.json(userVotes(userId));
  if (issueId) return NextResponse.json(votesForIssue(issueId));
  return NextResponse.json({ error: "issue_id or user_id required" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "remove") {
    return removeVote(body.issue_id, body.user_id, body.reaction as ReactionType)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const v = addVote(body.issue_id, body.user_id, body.reaction as ReactionType);
  return NextResponse.json(v, { status: 201 });
}
