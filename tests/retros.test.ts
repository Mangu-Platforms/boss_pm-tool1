import { describe, it, expect } from "vitest";
import { listRetros, getRetro, createRetro, addRetroItem, voteRetroItem, resolveRetroItem, updateRetroStatus, deleteRetro } from "@/lib/retros";

describe("retros", () => {
  it("lists default retros", () => {
    const retros = listRetros();
    expect(retros.length).toBeGreaterThanOrEqual(1);
  });

  it("gets retro by id", () => {
    const retro = getRetro("retro-1");
    expect(retro).toBeTruthy();
    expect(retro!.title).toBe("Sprint 1 Retro");
  });

  it("creates a retro", () => {
    const retro = createRetro("Sprint 2 Retro", "sprint-2");
    expect(retro.status).toBe("open");
    expect(retro.sprint_id).toBe("sprint-2");
    expect(retro.items).toHaveLength(0);
  });

  it("adds items to a retro", () => {
    const retro = createRetro("Item Test");
    const item = addRetroItem(retro.id, "went_well", "Great teamwork", "Alice");
    expect(item).toBeTruthy();
    expect(item!.type).toBe("went_well");
    expect(item!.votes).toBe(0);
  });

  it("votes on retro items", () => {
    const retro = createRetro("Vote Test");
    const item = addRetroItem(retro.id, "to_improve", "Slow deploys")!;
    expect(voteRetroItem(retro.id, item.id)).toBe(true);
    expect(voteRetroItem(retro.id, item.id)).toBe(true);
    const fetched = getRetro(retro.id)!;
    const updated = fetched.items.find((i) => i.id === item.id)!;
    expect(updated.votes).toBe(2);
  });

  it("resolves retro items", () => {
    const retro = createRetro("Resolve Test");
    const item = addRetroItem(retro.id, "action_item", "Fix CI")!;
    expect(resolveRetroItem(retro.id, item.id)).toBe(true);
    const fetched = getRetro(retro.id)!;
    expect(fetched.items.find((i) => i.id === item.id)!.resolved).toBe(true);
  });

  it("updates retro status", () => {
    const retro = createRetro("Status Test");
    const updated = updateRetroStatus(retro.id, "in_progress");
    expect(updated!.status).toBe("in_progress");
  });

  it("deletes a retro", () => {
    const retro = createRetro("Delete Me");
    expect(deleteRetro(retro.id)).toBe(true);
    expect(getRetro(retro.id)).toBeNull();
  });

  it("returns null for non-existent retro operations", () => {
    expect(addRetroItem("fake-id", "went_well", "test")).toBeNull();
    expect(voteRetroItem("fake-id", "fake-item")).toBe(false);
    expect(resolveRetroItem("fake-id", "fake-item")).toBe(false);
  });
});
