import { NextResponse } from "next/server";
import { listComments, listAllComments, addComment, deleteComment, getComment } from "@/lib/comments";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const issueId = url.searchParams.get("issue_id");
  const id = url.searchParams.get("id");

  if (id) {
    const cmt = getComment(id);
    return cmt ? NextResponse.json({ comment: cmt }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (issueId) {
    return NextResponse.json({ comments: listComments(issueId) });
  }

  return NextResponse.json({ comments: listAllComments() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteComment(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.issue_id || !body.body?.trim()) {
    return NextResponse.json({ error: "issue_id and body required" }, { status: 400 });
  }

  const comment = addComment(body.issue_id, body.body, body.author || "operator");
  return NextResponse.json({ comment }, { status: 201 });
}
