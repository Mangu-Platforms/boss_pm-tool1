import { NextResponse } from "next/server";
import { listWorkflows, getWorkflow, createWorkflow, updateWorkflow, addWorkflowStep, deleteWorkflow, runWorkflow } from "@/lib/workflows";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const wf = getWorkflow(id);
    if (!wf) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ workflow: wf });
  }

  return NextResponse.json({ workflows: listWorkflows() });
}

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteWorkflow(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "update") {
    const wf = updateWorkflow(body.id, body.updates || {});
    return wf ? NextResponse.json({ workflow: wf }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "add_step") {
    const wf = addWorkflowStep(body.workflow_id, body.step_action, body.config || {});
    return wf ? NextResponse.json({ workflow: wf }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "run") {
    const wf = runWorkflow(body.id);
    return wf ? NextResponse.json({ workflow: wf }) : NextResponse.json({ error: "Cannot run" }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const wf = createWorkflow(body.name, body.description || "", body.trigger || "manual", body.steps || []);
  return NextResponse.json({ workflow: wf }, { status: 201 });
}
