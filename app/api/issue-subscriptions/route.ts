import { NextRequest, NextResponse } from "next/server";
import { subscriptionsForIssue, subscriptionsForUser, getSubscription, subscribe, unsubscribe, subscriberCount } from "@/lib/issue-subscriptions";
import type { SubscriptionLevel } from "@/lib/issue-subscriptions";

export async function GET(req: NextRequest) {
  const issueId = req.nextUrl.searchParams.get("issue_id");
  const userId = req.nextUrl.searchParams.get("user_id");
  if (req.nextUrl.searchParams.get("count") !== null && issueId) {
    return NextResponse.json({ issue_id: issueId, count: subscriberCount(issueId) });
  }
  if (userId && issueId) {
    const sub = getSubscription(userId, issueId);
    return sub ? NextResponse.json(sub) : NextResponse.json({ subscribed: false });
  }
  if (userId) return NextResponse.json(subscriptionsForUser(userId));
  if (issueId) return NextResponse.json(subscriptionsForIssue(issueId));
  return NextResponse.json({ error: "issue_id or user_id required" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "unsubscribe") {
    return unsubscribe(body.user_id, body.issue_id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not subscribed" }, { status: 404 });
  }
  const sub = subscribe(body.user_id, body.issue_id, (body.level || "all") as SubscriptionLevel);
  return NextResponse.json(sub, { status: 201 });
}
