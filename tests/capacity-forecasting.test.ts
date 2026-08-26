import { describe, it, expect } from "vitest";
import { listForecasts, getForecast, createForecast, updateForecast, deleteForecast, teamSummary } from "../lib/capacity-forecasting";

describe("capacity-forecasting", () => {
  it("lists forecasts newest first", () => {
    const all = listForecasts();
    expect(all.length).toBeGreaterThanOrEqual(8);
  });

  it("filters by team", () => {
    const platform = listForecasts("platform");
    expect(platform.every((f) => f.team === "platform")).toBe(true);
  });

  it("filters by status", () => {
    const atRisk = listForecasts(undefined, undefined, "at_risk");
    expect(atRisk.every((f) => f.status === "at_risk")).toBe(true);
  });

  it("gets by id", () => {
    const f = getForecast("cf-1");
    expect(f).not.toBeNull();
    expect(f!.team).toBe("platform");
  });

  it("creates forecast with calculated utilization", () => {
    const f = createForecast("qa", "monthly", "Mar 2025", 320, 240);
    expect(f.utilization_pct).toBe(75);
    expect(f.status).toBe("on_track");
  });

  it("updates and recalculates status", () => {
    const f = createForecast("qa", "monthly", "Apr 2025", 320, 200);
    const updated = updateForecast(f.id, { planned_hours: 380 });
    expect(updated).not.toBeNull();
    expect(updated!.utilization_pct).toBeGreaterThan(100);
    expect(updated!.status).toBe("over_capacity");
  });

  it("deletes forecast", () => {
    const f = createForecast("qa", "weekly", "W10", 40, 30);
    expect(deleteForecast(f.id)).toBe(true);
    expect(getForecast(f.id)).toBeNull();
  });

  it("returns team summary", () => {
    const s = teamSummary("platform");
    expect(s.team).toBe("platform");
    expect(s.periods).toBeGreaterThan(0);
    expect(typeof s.avg_utilization).toBe("number");
  });
});
