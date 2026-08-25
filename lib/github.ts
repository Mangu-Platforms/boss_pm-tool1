import type { IssueLink, Product } from "./types";
import { upsertLinks } from "./store";

type GhIssue = {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  pull_request?: unknown;
};

export async function syncProductIssues(product: Product): Promise<IssueLink[]> {
  if (!product.github_repo) return [];
  const token = process.env.GITHUB_TOKEN;
  const owner = product.github_owner || process.env.GITHUB_OWNER || "Mangu-Platforms";
  const url = `https://api.github.com/repos/${owner}/${product.github_repo}/issues?state=all&per_page=50`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "boss-pm-tool1",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers, next: { revalidate: 30 } });
  if (!res.ok) {
    throw new Error(`GitHub ${res.status} on ${owner}/${product.github_repo}`);
  }
  const raw = (await res.json()) as GhIssue[];
  const issues = raw.filter((i) => !i.pull_request);
  const now = new Date().toISOString();
  const links: IssueLink[] = issues.map((i) => ({
    id: `gh-${owner}-${product.github_repo}-${i.number}`,
    issue_id: null,
    product_id: product.id,
    github_owner: owner,
    github_repo: product.github_repo!,
    github_issue_number: i.number,
    github_issue_id: String(i.id),
    github_state: i.state,
    github_title: i.title,
    github_html_url: i.html_url,
    synced_at: now,
  }));
  return upsertLinks(links);
}
