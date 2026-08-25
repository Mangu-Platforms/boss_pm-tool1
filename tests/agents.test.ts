import { describe, it, expect, beforeEach } from "vitest";

beforeEach(() => {
  const g = globalThis as typeof globalThis & { __boss?: unknown };
  delete g.__boss;
});

describe("Agents aggregation", () => {
  it("counts agent-assigned issues by agent name", async () => {
    const { listIssues } = await import("@/lib/store");
    const issues = listIssues();
    const agentIssues = issues.filter((i) => i.assignee_kind === "agent");

    expect(agentIssues.length).toBeGreaterThanOrEqual(3);

    const byAgent: Record<string, number> = {};
    for (const i of agentIssues) {
      const name = i.agent_name || "unknown";
      byAgent[name] = (byAgent[name] || 0) + 1;
    }
    expect(byAgent["alice"]).toBeGreaterThanOrEqual(1);
    expect(byAgent["swarm"]).toBeGreaterThanOrEqual(1);
  });

  it("sums cost caps per agent", async () => {
    const { listIssues } = await import("@/lib/store");
    const issues = listIssues();
    const agentIssues = issues.filter((i) => i.assignee_kind === "agent");

    const totalCap = agentIssues.reduce((acc, i) => acc + (i.cost_cap_cents || 0), 0);
    expect(totalCap).toBeGreaterThan(0);
    // Sum of all agent cost caps: alice=800+600+500, swarm=400+300+1200
    expect(totalCap).toBe(800 + 600 + 500 + 400 + 300 + 1200);
  });

  it("separates active from done counts", async () => {
    const { listIssues, updateIssue } = await import("@/lib/store");
    const issues = listIssues();
    const agentIssues = issues.filter((i) => i.assignee_kind === "agent");

    const activeCount = agentIssues.filter((i) => i.status !== "done" && i.status !== "cancelled").length;
    expect(activeCount).toBe(agentIssues.length); // all seed agent issues are active

    // Mark one done
    updateIssue(agentIssues[0].id, { status: "done" });
    const after = listIssues().filter((i) => i.assignee_kind === "agent");
    const doneCount = after.filter((i) => i.status === "done").length;
    expect(doneCount).toBe(1);
  });

  it("groups agent tasks by product", async () => {
    const { listIssues, listProducts } = await import("@/lib/store");
    const issues = listIssues();
    const products = listProducts();
    const agentIssues = issues.filter((i) => i.assignee_kind === "agent");
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const byProduct: Record<string, number> = {};
    for (const issue of agentIssues) {
      const name = productMap[issue.product_id]?.name || issue.product_id;
      byProduct[name] = (byProduct[name] || 0) + 1;
    }
    expect(Object.keys(byProduct).length).toBeGreaterThanOrEqual(2);
  });
});
