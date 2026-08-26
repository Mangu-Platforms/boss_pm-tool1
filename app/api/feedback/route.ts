import { NextResponse } from "next/server";
import { listFeedback, getFeedback, createFeedback, updateFeedbackStatus, voteFeedback, deleteFeedback, feedbackStats } from "@/lib/feedback";
import type { FeedbackType, FeedbackStatus } from "@/lib/feedback";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const view = url.searchParams.get("view");
  const status = url.searchParams.get("status") as FeedbackStatus | null;

  if (view === "stats") {
    return NextResponse.json({ stats: feedbackStats() });
  }

  if (id) {
    const fb = getFeedback(id);
    return fb
      ? NextResponse.json({ feedback: fb })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ feedback: listFeedback(status || undefined) });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "update_status") {
    const validStatuses: FeedbackStatus[] = ["new", "reviewed", "planned", "implemented", "wont_do"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const fb = updateFeedbackStatus(body.id, body.status);
    return fb
      ? NextResponse.json({ feedback: fb })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "vote") {
    return voteFeedback(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "delete") {
    return deleteFeedback(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const validTypes: FeedbackType[] = ["feature_request", "bug_report", "praise", "complaint", "suggestion"];
  if (!validTypes.includes(body.type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const fb = createFeedback(body.type, body.title, body.body || "", body.submitter, body.tags || []);
  return NextResponse.json({ feedback: fb }, { status: 201 });
}
