import { NextResponse } from "next/server";
import { dbListIssues, dbListProducts } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();
  if (!q) return NextResponse.json({ results: [] });

  const [issues, products] = await Promise.all([dbListIssues(), dbListProducts()]);

  const matchedProducts = products
    .filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
    .slice(0, 5)
    .map((p) => ({ type: "product" as const, id: p.id, title: p.name, slug: p.slug, url: `/products/${p.slug}` }));

  const matchedIssues = issues
    .filter((i) => i.title.toLowerCase().includes(q) || i.body.toLowerCase().includes(q))
    .slice(0, 10)
    .map((i) => ({ type: "issue" as const, id: i.id, title: i.title, status: i.status, url: `/issues/${i.id}` }));

  return NextResponse.json({ results: [...matchedProducts, ...matchedIssues] });
}
