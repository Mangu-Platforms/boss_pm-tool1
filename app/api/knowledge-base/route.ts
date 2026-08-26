import { NextRequest, NextResponse } from "next/server";
import { listArticles, getArticle, createArticle, updateArticle, recordView, markHelpful, deleteArticle, searchArticles, popularArticles } from "@/lib/knowledge-base";
import type { ArticleCategory, ArticleStatus } from "@/lib/knowledge-base";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const article = getArticle(id);
    return article ? NextResponse.json(article) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const q = req.nextUrl.searchParams.get("q");
  if (q) return NextResponse.json(searchArticles(q));
  if (req.nextUrl.searchParams.get("popular") !== null) {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "5", 10);
    return NextResponse.json(popularArticles(limit));
  }
  const category = req.nextUrl.searchParams.get("category") as ArticleCategory | undefined;
  const status = req.nextUrl.searchParams.get("status") as ArticleStatus | undefined;
  return NextResponse.json(listArticles(category || undefined, status || undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "delete") {
    return deleteArticle(body.id) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "update") {
    const article = updateArticle(body.id, body.updates);
    return article ? NextResponse.json(article) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "view") {
    const article = recordView(body.id);
    return article ? NextResponse.json(article) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (body.action === "helpful") {
    const article = markHelpful(body.id);
    return article ? NextResponse.json(article) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const article = createArticle(body.title, body.content, body.category as ArticleCategory, body.author || "max", body.tags || []);
  return NextResponse.json(article, { status: 201 });
}
