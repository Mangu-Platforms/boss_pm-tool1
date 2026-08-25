import { supabaseAdmin } from "./supabase";
import {
  listProducts as memProducts,
  listIssues as memIssues,
  createIssue as memCreate,
  getIssue as memGetIssue,
  updateIssue as memUpdate,
  deleteIssue as memDelete,
  validateCreate,
  listLinks as memLinks,
  upsertLinks as memUpsertLinks,
} from "./store";
import type { CreateIssueInput, Issue, IssueLink, Product } from "./types";

const sb = () => supabaseAdmin();

export async function dbListProducts(): Promise<Product[]> {
  const client = sb();
  if (!client) return memProducts();

  const { data, error } = await client
    .from("products")
    .select("*")
    .order("name");
  if (error || !data) return memProducts();
  return data as Product[];
}

export async function dbListIssues(productId?: string): Promise<Issue[]> {
  const client = sb();
  if (!client) return memIssues(productId);

  let query = client
    .from("issues")
    .select("*")
    .order("created_at", { ascending: false });
  if (productId) query = query.eq("product_id", productId);

  const { data, error } = await query;
  if (error || !data) return memIssues(productId);
  return data as Issue[];
}

export async function dbGetIssue(id: string): Promise<Issue | null> {
  const client = sb();
  if (!client) return memGetIssue(id) || null;

  const { data, error } = await client
    .from("issues")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return memGetIssue(id) || null;
  return data as Issue;
}

export async function dbCreateIssue(input: CreateIssueInput): Promise<Issue> {
  const err = validateCreate(input);
  if (err) throw new Error(err);

  const client = sb();
  if (!client) return memCreate(input);

  const now = new Date().toISOString();
  const row = {
    product_id: input.product_id,
    title: input.title.trim(),
    body: input.body?.trim() ?? "",
    status: "open",
    assignee_kind: input.assignee_kind,
    assignee_user: input.assignee_kind === "user" ? input.assignee_user!.trim() : null,
    agent_name: input.assignee_kind === "agent" ? input.agent_name! : null,
    cost_cap_cents: input.assignee_kind === "agent" ? input.cost_cap_cents! : null,
    due_on: input.due_on ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await client.from("issues").insert(row).select().single();
  if (error || !data) {
    return memCreate(input);
  }
  return data as Issue;
}

export async function dbUpdateIssue(
  id: string,
  updates: Partial<Pick<Issue, "status" | "title" | "body" | "due_on">>
): Promise<Issue | null> {
  const client = sb();
  if (!client) return memUpdate(id, updates);

  const { data, error } = await client
    .from("issues")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error || !data) return memUpdate(id, updates);
  return data as Issue;
}

export async function dbDeleteIssue(id: string): Promise<boolean> {
  const client = sb();
  if (!client) return memDelete(id);

  const { error } = await client.from("issues").delete().eq("id", id);
  if (error) return memDelete(id);
  return true;
}

export async function dbListLinks(productId?: string): Promise<IssueLink[]> {
  const client = sb();
  if (!client) return memLinks(productId);

  let query = client.from("issue_links").select("*").order("synced_at", { ascending: false });
  if (productId) query = query.eq("product_id", productId);

  const { data, error } = await query;
  if (error || !data) return memLinks(productId);
  return data as IssueLink[];
}

export async function dbUpsertLinks(links: IssueLink[]): Promise<IssueLink[]> {
  const client = sb();
  if (!client) return memUpsertLinks(links);

  const { data, error } = await client
    .from("issue_links")
    .upsert(links, { onConflict: "github_owner,github_repo,github_issue_number" })
    .select();
  if (error || !data) return memUpsertLinks(links);
  return data as IssueLink[];
}
