import { NextResponse } from "next/server";
import { listGoals, getGoal, createGoal, updateGoal, deleteGoal, addKeyResult, updateKeyResult } from "@/lib/goals";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const goal = getGoal(id);
    return goal
      ? NextResponse.json({ goal })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ goals: listGoals() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "update") {
    const updated = updateGoal(body.id, {
      title: body.title,
      description: body.description,
      status: body.status,
      progress: body.progress,
      target_date: body.target_date,
      owner: body.owner,
    });
    return updated
      ? NextResponse.json({ goal: updated })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "delete") {
    return deleteGoal(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "add_key_result") {
    const kr = addKeyResult(body.goal_id, body.title, body.target, body.unit || "units");
    return kr
      ? NextResponse.json({ key_result: kr })
      : NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  if (body.action === "update_key_result") {
    const kr = updateKeyResult(body.goal_id, body.kr_id, body.current);
    return kr
      ? NextResponse.json({ key_result: kr })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const goal = createGoal(body.title, body.description, body.owner, body.target_date);
  return NextResponse.json({ goal }, { status: 201 });
}
