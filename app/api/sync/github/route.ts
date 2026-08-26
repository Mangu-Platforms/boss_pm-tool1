import { NextResponse } from "next/server";
import { syncProductIssues } from "@/lib/github";
import { dbListLinks, dbListProducts } from "@/lib/db";
import { getProduct, mirrorStatusFromGithub } from "@/lib/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") || undefined;
  const product = slug ? getProduct(slug) : undefined;
  const links = await dbListLinks(product?.id);
  return NextResponse.json({ links });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const slug = body.slug as string | undefined;
  const allProducts = await dbListProducts();
  const targets = slug
    ? allProducts.filter((p) => p.slug === slug)
    : allProducts.filter((p) => p.github_repo);

  if (!targets.length) {
    return NextResponse.json({ error: "no product" }, { status: 404 });
  }

  const results = [];
  for (const p of targets) {
    try {
      const links = await syncProductIssues(p);
      results.push({ slug: p.slug, ok: true, count: links.length });
    } catch (e) {
      results.push({
        slug: p.slug,
        ok: false,
        error: e instanceof Error ? e.message : "sync failed",
      });
    }
  }

  const mirrored = mirrorStatusFromGithub();
  const product = slug ? getProduct(slug) : undefined;
  const links = await dbListLinks(product?.id);
  return NextResponse.json({ results, mirrored, links });
}
