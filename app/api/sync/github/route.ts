import { NextResponse } from "next/server";
import { syncProductIssues } from "@/lib/github";
import { getProduct, listLinks, listProducts, mirrorStatusFromGithub } from "@/lib/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") || undefined;
  const product = slug ? getProduct(slug) : undefined;
  return NextResponse.json({ links: listLinks(product?.id) });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const slug = body.slug as string | undefined;
  const targets = slug ? [getProduct(slug)].filter(Boolean) : listProducts().filter((p) => p.github_repo);
  if (!targets.length) {
    return NextResponse.json({ error: "no product" }, { status: 404 });
  }
  const results = [];
  for (const p of targets) {
    if (!p) continue;
    try {
      const links = await syncProductIssues(p);
      results.push({ slug: p.slug, ok: true, count: links.length });
    } catch (e) {
      results.push({ slug: p.slug, ok: false, error: e instanceof Error ? e.message : "sync failed" });
    }
  }
  const mirrored = mirrorStatusFromGithub();
  const product = slug ? getProduct(slug) : undefined;
  return NextResponse.json({ results, mirrored, links: listLinks(product?.id) });
}
