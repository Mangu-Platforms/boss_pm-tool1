import { describe, it, expect } from "vitest";
import { listBenchmarks, getBenchmark, createBenchmark, recordResult, deleteBenchmark, benchmarkSummary } from "@/lib/perf-benchmarks";

describe("perf-benchmarks", () => {
  it("lists benchmarks sorted by status priority", () => {
    const all = listBenchmarks();
    expect(all.length).toBeGreaterThanOrEqual(10);
    const statuses = all.map((b) => b.status);
    const firstFailing = statuses.indexOf("failing");
    const firstDegraded = statuses.indexOf("degraded");
    const firstPassing = statuses.indexOf("passing");
    if (firstFailing !== -1 && firstDegraded !== -1) expect(firstFailing).toBeLessThan(firstDegraded);
    if (firstDegraded !== -1 && firstPassing !== -1) expect(firstDegraded).toBeLessThan(firstPassing);
  });

  it("filters by service_id", () => {
    const svc1 = listBenchmarks("svc-1");
    expect(svc1.length).toBeGreaterThan(0);
    svc1.forEach((b) => expect(b.service_id).toBe("svc-1"));
  });

  it("filters by type", () => {
    const latency = listBenchmarks(undefined, "latency");
    expect(latency.length).toBeGreaterThan(0);
    latency.forEach((b) => expect(b.type).toBe("latency"));
  });

  it("filters by status", () => {
    const degraded = listBenchmarks(undefined, undefined, "degraded");
    expect(degraded.length).toBeGreaterThan(0);
    degraded.forEach((b) => expect(b.status).toBe("degraded"));
  });

  it("gets benchmark by id", () => {
    const b = getBenchmark("pb-1");
    expect(b).not.toBeNull();
    expect(b!.name).toBe("API Response P50");
    expect(getBenchmark("pb-9999")).toBeNull();
  });

  it("creates a benchmark", () => {
    const b = createBenchmark("svc-10", "New Bench", "cpu", 50, 90, "%");
    expect(b.id).toMatch(/^pb-/);
    expect(b.status).toBe("baseline");
    expect(b.current_value).toBe(50);
    expect(b.history).toEqual([50]);
    expect(getBenchmark(b.id)).not.toBeNull();
  });

  it("records a result and updates status/trend", () => {
    const b = createBenchmark("svc-10", "Record Test", "latency", 100, 200, "ms");
    const updated = recordResult(b.id, 250);
    expect(updated).not.toBeNull();
    expect(updated!.current_value).toBe(250);
    expect(updated!.history.length).toBe(2);
    expect(recordResult("pb-9999", 100)).toBeNull();
  });

  it("deletes a benchmark", () => {
    const b = createBenchmark("svc-10", "Delete Me", "memory", 100, 500, "MB");
    expect(deleteBenchmark(b.id)).toBe(true);
    expect(getBenchmark(b.id)).toBeNull();
    expect(deleteBenchmark("pb-9999")).toBe(false);
  });

  it("returns benchmark summary", () => {
    const s = benchmarkSummary();
    expect(s.total).toBeGreaterThan(0);
    expect(s.by_status).toBeDefined();
    expect(s.by_trend).toBeDefined();
  });
});
