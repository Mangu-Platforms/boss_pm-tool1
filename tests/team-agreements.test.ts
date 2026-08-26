import { describe, it, expect } from "vitest";
import { listAgreements, getAgreement, createAgreement, updateAgreement, approveAgreement, deleteAgreement, agreementStats } from "../lib/team-agreements";

describe("team-agreements", () => {
  it("lists agreements sorted by updated_at desc", () => {
    const all = listAgreements();
    expect(all.length).toBeGreaterThanOrEqual(7);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].updated_at >= all[i].updated_at).toBe(true);
    }
  });

  it("filters by team", () => {
    const platform = listAgreements("platform");
    expect(platform.every((a) => a.team === "platform")).toBe(true);
  });

  it("filters by type", () => {
    const code = listAgreements(undefined, "code_standards");
    expect(code.every((a) => a.type === "code_standards")).toBe(true);
  });

  it("gets by id", () => {
    const ag = getAgreement("ag-1");
    expect(ag).not.toBeNull();
    expect(ag!.title).toBe("Core Hours");
  });

  it("creates agreement as draft", () => {
    const ag = createAgreement("data", "working_agreement", "Test Agreement", "Content here", "max");
    expect(ag.status).toBe("draft");
    expect(ag.version).toBe(1);
  });

  it("increments version on content change", () => {
    const ag = createAgreement("data", "review_policy", "Review Policy", "Original", "sami");
    const updated = updateAgreement(ag.id, { content: "Updated content" });
    expect(updated).not.toBeNull();
    expect(updated!.version).toBe(2);
  });

  it("approves agreement", () => {
    const ag = createAgreement("infra", "communication", "Comms", "Content", "max");
    const approved = approveAgreement(ag.id, "sami");
    expect(approved).not.toBeNull();
    expect(approved!.approved_by).toContain("sami");
  });

  it("returns stats", () => {
    const s = agreementStats("platform");
    expect(s.total).toBeGreaterThan(0);
    expect(typeof s.active).toBe("number");
  });
});
