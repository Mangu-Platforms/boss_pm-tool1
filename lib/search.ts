import { listIssues } from "./store";
import { listProducts } from "./store";
import { listMilestones } from "./milestones";
import { listEpics } from "./epics";

export type SearchResultType = "issue" | "product" | "milestone" | "epic";

export type SearchResult = {
  type: SearchResultType;
  id: string;
  title: string;
  status: string;
  match_field: string;
  snippet: string;
};

export function search(query: string, types?: SearchResultType[]): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];
  const allowed = types || ["issue", "product", "milestone", "epic"];

  if (allowed.includes("issue")) {
    for (const i of listIssues()) {
      const titleMatch = i.title.toLowerCase().includes(q);
      const bodyMatch = i.body.toLowerCase().includes(q);
      if (titleMatch || bodyMatch) {
        results.push({
          type: "issue",
          id: i.id,
          title: i.title,
          status: i.status,
          match_field: titleMatch ? "title" : "body",
          snippet: titleMatch ? i.title : i.body.substring(0, 120),
        });
      }
    }
  }

  if (allowed.includes("product")) {
    for (const p of listProducts()) {
      const nameMatch = p.name.toLowerCase().includes(q);
      const slugMatch = p.slug.toLowerCase().includes(q);
      if (nameMatch || slugMatch) {
        results.push({
          type: "product",
          id: p.id,
          title: p.name,
          status: "active",
          match_field: nameMatch ? "name" : "slug",
          snippet: p.slug,
        });
      }
    }
  }

  if (allowed.includes("milestone")) {
    for (const m of listMilestones()) {
      const nameMatch = m.name.toLowerCase().includes(q);
      const descMatch = m.description.toLowerCase().includes(q);
      if (nameMatch || descMatch) {
        results.push({
          type: "milestone",
          id: m.id,
          title: m.name,
          status: m.status,
          match_field: nameMatch ? "name" : "description",
          snippet: nameMatch ? m.name : m.description.substring(0, 120),
        });
      }
    }
  }

  if (allowed.includes("epic")) {
    for (const e of listEpics()) {
      const nameMatch = e.name.toLowerCase().includes(q);
      const descMatch = e.description.toLowerCase().includes(q);
      if (nameMatch || descMatch) {
        results.push({
          type: "epic",
          id: e.id,
          title: e.name,
          status: e.status,
          match_field: nameMatch ? "name" : "description",
          snippet: nameMatch ? e.name : e.description.substring(0, 120),
        });
      }
    }
  }

  return results;
}
