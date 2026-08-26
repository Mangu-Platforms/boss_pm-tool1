import { NextRequest, NextResponse } from "next/server";
import { listPostMortems, getPostMortem, createPostMortem, updatePostMortem, addActionItem, updateActionItem, deletePostMortem, postMortemStats } from "@/lib/post-mortems";
import type { PostMortemStatus, PostMortemSeverity } from "@/lib/post-mortems";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const pm = getPostMortem(id);
    return pm ? NextResponse.json(pm) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (req.nextUrl.searchParams.get("stats") !== null) return NextResponse.json(postMortemStats());
  const status = req.nextUrl.searchParams.get("status") as PostMortemStatus | undefined;
  const severity = req.nextUrl.searchParams.get("severity") as PostMortemSeverity | undefined;
  return NextResponse.json(listPostMortems(status || undefined, severity || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deletePostMortem(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const pm = updatePostMortem(body.id, body.updates);
    return pm ? NextResponse.json(pm) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "add_action") {
    const item = addActionItem(body.pm_id, body.description, body.owner, body.due_date);
    return item ? NextResponse.json(item, { status: 201 }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update_action") {
    const item = updateActionItem(body.pm_id, body.action_id, body.updates);
    return item ? NextResponse.json(item) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const pm = createPostMortem(body.title, body.summary, body.severity, body.root_cause, body.timeline, body.author || "max", body.incident_id);
  return NextResponse.json(pm, { status: 201 });
}
