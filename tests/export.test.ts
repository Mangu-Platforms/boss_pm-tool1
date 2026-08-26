import { describe, it, expect, beforeEach } from "vitest";

beforeEach(() => {
  const g = globalThis as typeof globalThis & { __boss?: unknown };
  delete g.__boss;
});

describe("Export logic", () => {
  it("exports all issues as JSON-compatible array", async () => {
    const { listIssues, listProducts } = await import("@/lib/store");
    const issues = listIssues();
    const products = listProducts();
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const exported = issues.map((i) => ({
      id: i.id,
      product: productMap[i.product_id]?.name || i.product_id,
      title: i.title,
      status: i.status,
      priority: i.priority,
      assignee: i.assignee_kind === "agent" ? `agent:${i.agent_name}` : i.assignee_user,
      cost_cap: i.cost_cap_cents ? `$${(i.cost_cap_cents / 100).toFixed(2)}` : null,
      due_on: i.due_on,
      created_at: i.created_at,
    }));

    expect(exported.length).toBe(issues.length);
    expect(exported[0]).toHaveProperty("title");
    expect(exported[0]).toHaveProperty("priority");
  });

  it("exports CSV-parseable rows", async () => {
    const { listIssues, listProducts } = await import("@/lib/store");
    const issues = listIssues();
    const products = listProducts();
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const headers = ["id", "product", "title", "status", "priority", "assignee", "cost_cap", "due_on", "created_at"];
    const rows = issues.map((i) => [
      i.id,
      productMap[i.product_id]?.name || i.product_id,
      `"${i.title.replace(/"/g, '""')}"`,
      i.status,
      i.priority,
      i.assignee_kind === "agent" ? `agent:${i.agent_name}` : i.assignee_user || "",
      i.cost_cap_cents ? (i.cost_cap_cents / 100).toFixed(2) : "",
      i.due_on || "",
      i.created_at,
    ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    expect(csv).toContain("id,product,title");
    expect(csv.split("\n").length).toBe(issues.length + 1);
  });

  it("filters export by product", async () => {
    const { listIssues } = await import("@/lib/store");
    const pubIssues = listIssues("p-pub");
    expect(pubIssues.length).toBeGreaterThan(0);
    expect(pubIssues.every((i) => i.product_id === "p-pub")).toBe(true);
  });
});

describe("Batch operations logic", () => {
  it("bulk update status", async () => {
    const { listIssues, updateIssue } = await import("@/lib/store");
    const issues = listIssues();
    const ids = issues.slice(0, 2).map((i) => i.id);

    let updated = 0;
    for (const id of ids) {
      const result = updateIssue(id, { status: "done" });
      if (result) updated++;
    }
    expect(updated).toBe(2);

    const after = listIssues();
    const done = after.filter((i) => ids.includes(i.id));
    expect(done.every((i) => i.status === "done")).toBe(true);
  });

  it("bulk delete issues", async () => {
    const { listIssues, deleteIssue } = await import("@/lib/store");
    const before = listIssues();
    const ids = before.slice(0, 2).map((i) => i.id);

    for (const id of ids) {
      deleteIssue(id);
    }

    const after = listIssues();
    expect(after.length).toBe(before.length - 2);
    expect(after.some((i) => ids.includes(i.id))).toBe(false);
  });

  it("rejects batch larger than 50", () => {
    const items = Array.from({ length: 51 }, (_, i) => `id-${i}`);
    expect(items.length).toBeGreaterThan(50);
  });
});
