import { NextResponse } from "next/server";
import { dbListProducts } from "@/lib/db";
import { syncProductIssues } from "@/lib/github";
import { logActivity } from "@/lib/activity";

export async function POST(req: Request) {
  const event = req.headers.get("x-github-event");
  const payload = await req.json().catch(() => null);

  if (!payload) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  if (event === "issues" || event === "issue_comment") {
    const repo = payload.repository?.name;
    if (!repo) {
      return NextResponse.json({ ok: true, action: "no-repo" });
    }

    const products = await dbListProducts();
    const product = products.find((p) => p.github_repo === repo);
    if (!product) {
      return NextResponse.json({ ok: true, action: "no-matching-product" });
    }

    try {
      await syncProductIssues(product);
      logActivity(
        { id: product.id, product_id: product.id },
        "updated",
        `GitHub webhook: ${event} on ${repo}`
      );
      return NextResponse.json({ ok: true, action: "synced", product: product.slug });
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: e instanceof Error ? e.message : "sync failed" },
        { status: 500 }
      );
    }
  }

  if (event === "ping") {
    return NextResponse.json({ ok: true, action: "pong" });
  }

  return NextResponse.json({ ok: true, action: "ignored", event });
}
