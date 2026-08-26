import { NextResponse } from "next/server";
import { listProjectTemplates, getProjectTemplate, createProjectTemplate, deleteProjectTemplate } from "@/lib/project-templates";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const id = url.searchParams.get("id");
  if (id) {
    const tpl = getProjectTemplate(id);
    if (!tpl) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ template: tpl });
  }
  return NextResponse.json({ templates: listProjectTemplates(category || undefined) });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (body.action === "apply") {
    if (!body.template_id) return NextResponse.json({ error: "template_id required" }, { status: 400 });
    const tpl = getProjectTemplate(body.template_id);
    if (!tpl) return NextResponse.json({ error: "template not found" }, { status: 404 });
    return NextResponse.json({ issues: tpl.issues }, { status: 200 });
  }

  if (!body.name?.trim() || !body.issues?.length) {
    return NextResponse.json({ error: "name and issues required" }, { status: 400 });
  }
  const tpl = createProjectTemplate(body.name.trim(), body.description || "", body.issues, body.category || "general");
  return NextResponse.json({ template: tpl }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const removed = deleteProjectTemplate(id);
  if (!removed) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
