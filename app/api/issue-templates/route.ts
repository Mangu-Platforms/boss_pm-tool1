import { NextResponse } from "next/server";
import { listIssueTemplates, getIssueTemplate, createIssueTemplate, deleteIssueTemplate } from "@/lib/issue-templates";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const tmpl = getIssueTemplate(id);
    return tmpl
      ? NextResponse.json({ template: tmpl })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ templates: listIssueTemplates() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "delete") {
    return deleteIssueTemplate(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const template = createIssueTemplate(
    body.name,
    body.description || "",
    body.title_template || "",
    body.body_template || "",
    body.default_priority,
    body.default_labels,
    body.fields
  );
  return NextResponse.json({ template }, { status: 201 });
}
