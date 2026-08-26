import { describe, it, expect } from "vitest";
import { listAlerts, getAlert, createAlert, evaluateAlert, acknowledgeAlert, deleteAlert } from "../lib/metric-alerts";

describe("metric-alerts", () => {
  it("lists all alerts", () => {
    const all = listAlerts();
    expect(all.length).toBeGreaterThanOrEqual(3);
  });

  it("filters by status", () => {
    const active = listAlerts("active");
    expect(active.every((a) => a.status === "active")).toBe(true);
  });

  it("gets alert by id", () => {
    const a = getAlert("ma-1");
    expect(a).not.toBeNull();
    expect(a!.name).toBe("High open issue count");
  });

  it("creates alert", () => {
    const a = createAlert("Test alert", "test.metric", "gt", 100, ["max"]);
    expect(a.name).toBe("Test alert");
    expect(a.status).toBe("active");
  });

  it("evaluates alert — triggers when condition met", () => {
    const a = createAlert("Eval test", "eval.metric", "gt", 10, []);
    const result = evaluateAlert(a.id, 15);
    expect(result).not.toBeNull();
    expect(result!.status).toBe("triggered");
    expect(result!.current_value).toBe(15);
  });

  it("evaluates alert — resolves when condition no longer met", () => {
    const a = createAlert("Resolve test", "resolve.metric", "gt", 10, []);
    evaluateAlert(a.id, 15);
    const result = evaluateAlert(a.id, 5);
    expect(result).not.toBeNull();
    expect(result!.status).toBe("resolved");
  });

  it("acknowledges triggered alert", () => {
    const a = createAlert("Ack test", "ack.metric", "lt", 50, []);
    evaluateAlert(a.id, 10);
    const result = acknowledgeAlert(a.id);
    expect(result).not.toBeNull();
    expect(result!.status).toBe("acknowledged");
  });

  it("deletes alert", () => {
    const a = createAlert("Del test", "del.metric", "eq", 0, []);
    expect(deleteAlert(a.id)).toBe(true);
    expect(getAlert(a.id)).toBeNull();
  });
});
