export type BenchmarkType = "latency" | "throughput" | "memory" | "cpu" | "disk_io";
export type BenchmarkStatus = "passing" | "degraded" | "failing" | "baseline";

export type Benchmark = {
  id: string;
  service_id: string;
  name: string;
  type: BenchmarkType;
  baseline_value: number;
  current_value: number;
  threshold_value: number;
  unit: string;
  status: BenchmarkStatus;
  trend: "improving" | "stable" | "degrading";
  last_run: string;
  history: number[];
};

let nextId = 11;

const benchmarks: Benchmark[] = [
  { id: "pb-1", service_id: "svc-1", name: "API Response P50", type: "latency", baseline_value: 45, current_value: 48, threshold_value: 100, unit: "ms", status: "passing", trend: "stable", last_run: "2025-01-25T10:00:00Z", history: [44, 45, 46, 47, 48] },
  { id: "pb-2", service_id: "svc-1", name: "API Response P99", type: "latency", baseline_value: 200, current_value: 350, threshold_value: 500, unit: "ms", status: "degraded", trend: "degrading", last_run: "2025-01-25T10:00:00Z", history: [210, 250, 280, 320, 350] },
  { id: "pb-3", service_id: "svc-1", name: "Requests/sec", type: "throughput", baseline_value: 5000, current_value: 4800, threshold_value: 3000, unit: "req/s", status: "passing", trend: "stable", last_run: "2025-01-25T10:00:00Z", history: [5100, 5000, 4900, 4850, 4800] },
  { id: "pb-4", service_id: "svc-2", name: "Memory Usage", type: "memory", baseline_value: 512, current_value: 780, threshold_value: 1024, unit: "MB", status: "degraded", trend: "degrading", last_run: "2025-01-25T10:00:00Z", history: [520, 600, 680, 740, 780] },
  { id: "pb-5", service_id: "svc-2", name: "API Response P50", type: "latency", baseline_value: 30, current_value: 28, threshold_value: 80, unit: "ms", status: "passing", trend: "improving", last_run: "2025-01-25T10:00:00Z", history: [35, 33, 31, 29, 28] },
  { id: "pb-6", service_id: "svc-3", name: "Query Response Time", type: "latency", baseline_value: 100, current_value: 550, threshold_value: 300, unit: "ms", status: "failing", trend: "degrading", last_run: "2025-01-25T10:00:00Z", history: [120, 200, 350, 450, 550] },
  { id: "pb-7", service_id: "svc-3", name: "CPU Utilization", type: "cpu", baseline_value: 40, current_value: 65, threshold_value: 80, unit: "%", status: "degraded", trend: "degrading", last_run: "2025-01-25T10:00:00Z", history: [42, 48, 55, 60, 65] },
  { id: "pb-8", service_id: "svc-4", name: "Disk Write IOPS", type: "disk_io", baseline_value: 10000, current_value: 9500, threshold_value: 5000, unit: "iops", status: "passing", trend: "stable", last_run: "2025-01-25T10:00:00Z", history: [10200, 10100, 9800, 9600, 9500] },
  { id: "pb-9", service_id: "svc-4", name: "Event Processing", type: "throughput", baseline_value: 2000, current_value: 2200, threshold_value: 1500, unit: "events/s", status: "passing", trend: "improving", last_run: "2025-01-25T10:00:00Z", history: [1900, 1950, 2050, 2150, 2200] },
  { id: "pb-10", service_id: "svc-5", name: "Cold Start Time", type: "latency", baseline_value: 800, current_value: 750, threshold_value: 1500, unit: "ms", status: "passing", trend: "improving", last_run: "2025-01-25T10:00:00Z", history: [900, 880, 820, 780, 750] },
];

function calcStatus(current: number, threshold: number, type: BenchmarkType): BenchmarkStatus {
  const isLowerBetter = type === "latency" || type === "memory" || type === "cpu";
  if (isLowerBetter) {
    if (current > threshold) return "failing";
    if (current > threshold * 0.7) return "degraded";
    return "passing";
  }
  if (current < threshold) return "failing";
  if (current < threshold * 1.3) return "degraded";
  return "passing";
}

export function listBenchmarks(service_id?: string, type?: BenchmarkType, status?: BenchmarkStatus): Benchmark[] {
  let result = [...benchmarks];
  if (service_id) result = result.filter((b) => b.service_id === service_id);
  if (type) result = result.filter((b) => b.type === type);
  if (status) result = result.filter((b) => b.status === status);
  const statusOrder: Record<string, number> = { failing: 0, degraded: 1, passing: 2, baseline: 3 };
  return result.sort((a, b) => (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4));
}

export function getBenchmark(id: string): Benchmark | null {
  return benchmarks.find((b) => b.id === id) || null;
}

export function createBenchmark(service_id: string, name: string, type: BenchmarkType, baseline_value: number, threshold_value: number, unit: string): Benchmark {
  const b: Benchmark = {
    id: `pb-${nextId++}`,
    service_id,
    name,
    type,
    baseline_value,
    current_value: baseline_value,
    threshold_value,
    unit,
    status: "baseline",
    trend: "stable",
    last_run: new Date().toISOString(),
    history: [baseline_value],
  };
  benchmarks.push(b);
  return b;
}

export function recordResult(id: string, value: number): Benchmark | null {
  const b = benchmarks.find((bm) => bm.id === id);
  if (!b) return null;
  b.history.push(value);
  if (b.history.length > 10) b.history.shift();
  b.current_value = value;
  b.last_run = new Date().toISOString();
  b.status = calcStatus(value, b.threshold_value, b.type);
  const avg = b.history.reduce((s, v) => s + v, 0) / b.history.length;
  const recent = b.history.slice(-3).reduce((s, v) => s + v, 0) / Math.min(3, b.history.length);
  if (recent < avg * 0.95) b.trend = "improving";
  else if (recent > avg * 1.05) b.trend = "degrading";
  else b.trend = "stable";
  return b;
}

export function deleteBenchmark(id: string): boolean {
  const idx = benchmarks.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  benchmarks.splice(idx, 1);
  return true;
}

export function benchmarkSummary() {
  const total = benchmarks.length;
  const by_status: Record<string, number> = {};
  const by_trend: Record<string, number> = {};
  benchmarks.forEach((b) => {
    by_status[b.status] = (by_status[b.status] || 0) + 1;
    by_trend[b.trend] = (by_trend[b.trend] || 0) + 1;
  });
  return { total, by_status, by_trend };
}
