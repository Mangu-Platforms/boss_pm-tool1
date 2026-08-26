import { NextResponse } from "next/server";
import { dbListIssues, dbListProducts } from "@/lib/db";
import { listMilestones } from "@/lib/milestones";
import { listEpics } from "@/lib/epics";

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

  const matchedMilestones = listMilestones()
    .filter((m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q))
    .slice(0, 5)
    .map((m) => ({ type: "milestone" as const, id: m.id, title: m.name, status: m.status, url: `/milestones` }));

  const matchedEpics = listEpics()
    .filter((e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
    .slice(0, 5)
    .map((e) => ({ type: "epic" as const, id: e.id, title: e.name, status: e.status, url: `/epics` }));

  return NextResponse.json({ results: [...matchedProducts, ...matchedIssues, ...matchedMilestones, ...matchedEpics] });
}
