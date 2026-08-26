import { describe, it, expect } from "vitest";
import { listDecisions, getDecision, createDecision, updateDecisionStatus, updateDecision, deleteDecision } from "@/lib/decisions";

describe("decisions", () => {
  it("lists default decisions", () => {
    const decisions = listDecisions();
    expect(decisions.length).toBeGreaterThanOrEqual(3);
  });

  it("gets decision by id", () => {
    const d = getDecision("adr-001");
    expect(d).toBeTruthy();
    expect(d!.title).toContain("Next.js");
  });

  it("creates a decision", () => {
    const d = createDecision("Use PostgreSQL", "Need persistent storage", "Migrate to PostgreSQL", "Requires hosting", "Max", ["Max", "Alice"]);
    expect(d.status).toBe("proposed");
    expect(d.decided_at).toBeNull();
    expect(d.participants).toContain("Alice");
  });

  it("accepts a decision and sets decided_at", () => {
    const d = createDecision("Test accept", "", "", "");
    const updated = updateDecisionStatus(d.id, "accepted");
    expect(updated!.status).toBe("accepted");
    expect(updated!.decided_at).toBeTruthy();
  });

  it("rejects a decision", () => {
    const d = createDecision("Test reject", "", "", "");
    const updated = updateDecisionStatus(d.id, "rejected");
    expect(updated!.status).toBe("rejected");
    expect(updated!.decided_at).toBeTruthy();
  });

  it("updates decision content", () => {
    const d = createDecision("Update me", "old", "old", "old");
    const updated = updateDecision(d.id, { context: "new context", consequences: "new consequences" });
    expect(updated!.context).toBe("new context");
    expect(updated!.consequences).toBe("new consequences");
  });

  it("deletes a decision", () => {
    const d = createDecision("Delete me", "", "", "");
    expect(deleteDecision(d.id)).toBe(true);
    expect(getDecision(d.id)).toBeNull();
  });
});
