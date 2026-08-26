import { describe, it, expect } from "vitest";
import { listShifts, getShift, createShift, requestSwap, currentOncall, listOverrides, createOverride, deleteShift } from "../lib/oncall-schedule";

describe("oncall-schedule", () => {
  it("lists all shifts sorted by start_date", () => {
    const all = listShifts();
    expect(all.length).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].start_date <= all[i].start_date).toBe(true);
    }
  });

  it("filters by team", () => {
    const platform = listShifts("platform");
    expect(platform.every((s) => s.team === "platform")).toBe(true);
  });

  it("gets by id", () => {
    const shift = getShift("oc-1");
    expect(shift).not.toBeNull();
    expect(shift!.member).toBe("max");
  });

  it("creates shift", () => {
    const shift = createShift("alex", "primary", "2025-09-08", "2025-09-14", "platform");
    expect(shift.swap_requested).toBe(false);
  });

  it("requests swap", () => {
    const shift = requestSwap("oc-1");
    expect(shift).not.toBeNull();
    expect(shift!.swap_requested).toBe(true);
  });

  it("lists overrides", () => {
    const all = listOverrides();
    expect(all.length).toBeGreaterThanOrEqual(1);
  });

  it("creates override", () => {
    const ov = createOverride("max", "priya", "2025-08-28", "Doctor appointment");
    expect(ov.original_member).toBe("max");
    expect(ov.override_member).toBe("priya");
  });

  it("deletes shift", () => {
    const shift = createShift("test", "secondary", "2025-10-01", "2025-10-07", "data");
    expect(deleteShift(shift.id)).toBe(true);
    expect(getShift(shift.id)).toBeNull();
  });
});
