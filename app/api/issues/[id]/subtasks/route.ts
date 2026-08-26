import { NextResponse } from "next/server";
import { addSubtask, listSubtasks, toggleSubtask, removeSubtask } from "@/lib/subtasks";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subtasks = listSubtasks(id);
  return NextResponse.json({ subtasks });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const subtask = addSubtask(id, body.title.trim());
  return NextResponse.json({ subtask }, { status: 201 });
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const subtaskId = searchParams.get("subtask_id");
  if (!subtaskId) {
    return NextResponse.json({ error: "subtask_id required" }, { status: 400 });
  }
  const subtask = toggleSubtask(subtaskId);
  if (!subtask) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ subtask });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const subtaskId = searchParams.get("subtask_id");
  if (!subtaskId) {
    return NextResponse.json({ error: "subtask_id required" }, { status: 400 });
  }
  const removed = removeSubtask(subtaskId);
  if (!removed) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
