import { NextResponse } from "next/server";
import { listChecklists, getChecklist, createChecklist, addChecklistItem, toggleChecklistItem, deleteChecklist, checklistProgress } from "@/lib/checklists";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const issueId = url.searchParams.get("issue_id");
  const view = url.searchParams.get("view");

  if (id && view === "progress") {
    return NextResponse.json(checklistProgress(id));
  }

  if (id) {
    const cl = getChecklist(id);
    return cl ? NextResponse.json({ checklist: cl }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ checklists: listChecklists(issueId || undefined) });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteChecklist(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "add_item") {
    if (!body.checklist_id || !body.text?.trim()) {
      return NextResponse.json({ error: "checklist_id and text required" }, { status: 400 });
    }
    const cl = addChecklistItem(body.checklist_id, body.text.trim());
    return cl ? NextResponse.json({ checklist: cl }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "toggle") {
    if (!body.checklist_id || !body.item_id) {
      return NextResponse.json({ error: "checklist_id and item_id required" }, { status: 400 });
    }
    const cl = toggleChecklistItem(body.checklist_id, body.item_id);
    return cl ? NextResponse.json({ checklist: cl }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.issue_id || !body.title?.trim()) {
    return NextResponse.json({ error: "issue_id and title required" }, { status: 400 });
  }

  const items = body.items && Array.isArray(body.items) ? body.items : undefined;
  const cl = createChecklist(body.issue_id, body.title.trim(), items);
  return NextResponse.json({ checklist: cl }, { status: 201 });
}
