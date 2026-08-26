import { NextResponse } from "next/server";
import { listEpics, getEpic, createEpic, updateEpic, deleteEpic, addIssueToEpic, removeIssueFromEpic, issuesForEpic } from "@/lib/epics";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const epic = getEpic(id);
    if (!epic) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const issue_ids = issuesForEpic(id);
    return NextResponse.json({ epic, issue_ids });
  }

  const epics = listEpics();
  const enriched = epics.map((e) => ({
    ...e,
    issue_count: issuesForEpic(e.id).length,
  }));
  return NextResponse.json({ epics: enriched });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "update") {
    const updated = updateEpic(body.id, {
      name: body.name,
      description: body.description,
      color: body.color,
      status: body.status,
      owner: body.owner,
    });
    return updated
      ? NextResponse.json({ epic: updated })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "delete") {
    return deleteEpic(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "add_issue") {
    const ok = addIssueToEpic(body.epic_id, body.issue_id);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Epic not found" }, { status: 404 });
  }

  if (body.action === "remove_issue") {
    removeIssueFromEpic(body.epic_id, body.issue_id);
    return NextResponse.json({ ok: true });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const epic = createEpic(body.name, body.description, body.color, body.owner);
  return NextResponse.json({ epic }, { status: 201 });
}
