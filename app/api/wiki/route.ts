import { NextResponse } from "next/server";
import { listWikiPages, getWikiPage, getWikiPageBySlug, createWikiPage, updateWikiPage, deleteWikiPage, searchWiki, getChildPages } from "@/lib/wiki";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const slug = url.searchParams.get("slug");
  const search = url.searchParams.get("search");
  const children = url.searchParams.get("children");

  if (search) {
    return NextResponse.json({ pages: searchWiki(search) });
  }

  if (children) {
    return NextResponse.json({ pages: getChildPages(children) });
  }

  if (slug) {
    const page = getWikiPageBySlug(slug);
    return page
      ? NextResponse.json({ page })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (id) {
    const page = getWikiPage(id);
    return page
      ? NextResponse.json({ page })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ pages: listWikiPages() });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "update") {
    const page = updateWikiPage(body.id, { title: body.title, content: body.content, parent_id: body.parent_id });
    return page
      ? NextResponse.json({ page })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.action === "delete") {
    return deleteWikiPage(body.id)
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const page = createWikiPage(body.title, body.content || "", body.author, body.parent_id);
  return NextResponse.json({ page }, { status: 201 });
}
