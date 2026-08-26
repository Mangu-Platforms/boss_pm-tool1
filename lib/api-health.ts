export type HealthStatus = "healthy" | "degraded" | "down" | "unknown";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type Endpoint = {
  id: string;
  service_id: string;
  method: HttpMethod;
  path: string;
  status: HealthStatus;
  response_time_ms: number;
  uptime_pct: number;
  last_checked: string;
  error_rate_pct: number;
  requests_per_minute: number;
};

export type HealthCheck = {
  id: string;
  endpoint_id: string;
  status: HealthStatus;
  response_time_ms: number;
  status_code: number;
  checked_at: string;
};

let nextId = 11;
let nextCheckId = 20;

const endpoints: Endpoint[] = [
  { id: "ep-1", service_id: "svc-1", method: "GET", path: "/api/users", status: "healthy", response_time_ms: 45, uptime_pct: 99.98, last_checked: "2025-01-25T10:00:00Z", error_rate_pct: 0.02, requests_per_minute: 250 },
  { id: "ep-2", service_id: "svc-1", method: "POST", path: "/api/users", status: "healthy", response_time_ms: 120, uptime_pct: 99.95, last_checked: "2025-01-25T10:00:00Z", error_rate_pct: 0.1, requests_per_minute: 45 },
  { id: "ep-3", service_id: "svc-1", method: "GET", path: "/api/auth/token", status: "degraded", response_time_ms: 850, uptime_pct: 99.5, last_checked: "2025-01-25T10:00:00Z", error_rate_pct: 2.1, requests_per_minute: 500 },
  { id: "ep-4", service_id: "svc-2", method: "GET", path: "/api/products", status: "healthy", response_time_ms: 65, uptime_pct: 99.99, last_checked: "2025-01-25T10:00:00Z", error_rate_pct: 0.01, requests_per_minute: 180 },
  { id: "ep-5", service_id: "svc-2", method: "POST", path: "/api/orders", status: "healthy", response_time_ms: 200, uptime_pct: 99.9, last_checked: "2025-01-25T10:00:00Z", error_rate_pct: 0.5, requests_per_minute: 80 },
  { id: "ep-6", service_id: "svc-3", method: "GET", path: "/api/search", status: "degraded", response_time_ms: 1200, uptime_pct: 98.5, last_checked: "2025-01-25T10:00:00Z", error_rate_pct: 3.5, requests_per_minute: 300 },
  { id: "ep-7", service_id: "svc-3", method: "GET", path: "/api/recommendations", status: "down", response_time_ms: 0, uptime_pct: 95.0, last_checked: "2025-01-25T10:00:00Z", error_rate_pct: 100, requests_per_minute: 0 },
  { id: "ep-8", service_id: "svc-4", method: "POST", path: "/api/notifications/send", status: "healthy", response_time_ms: 30, uptime_pct: 99.99, last_checked: "2025-01-25T10:00:00Z", error_rate_pct: 0.05, requests_per_minute: 120 },
  { id: "ep-9", service_id: "svc-4", method: "GET", path: "/api/notifications", status: "healthy", response_time_ms: 55, uptime_pct: 99.95, last_checked: "2025-01-25T10:00:00Z", error_rate_pct: 0.1, requests_per_minute: 90 },
  { id: "ep-10", service_id: "svc-5", method: "GET", path: "/api/analytics/events", status: "unknown", response_time_ms: 0, uptime_pct: 0, last_checked: "2025-01-20T10:00:00Z", error_rate_pct: 0, requests_per_minute: 0 },
];

const checks: HealthCheck[] = [
  { id: "hc-1", endpoint_id: "ep-1", status: "healthy", response_time_ms: 42, status_code: 200, checked_at: "2025-01-25T10:00:00Z" },
  { id: "hc-2", endpoint_id: "ep-1", status: "healthy", response_time_ms: 48, status_code: 200, checked_at: "2025-01-25T09:55:00Z" },
  { id: "hc-3", endpoint_id: "ep-3", status: "degraded", response_time_ms: 850, status_code: 200, checked_at: "2025-01-25T10:00:00Z" },
  { id: "hc-4", endpoint_id: "ep-3", status: "healthy", response_time_ms: 120, status_code: 200, checked_at: "2025-01-25T09:55:00Z" },
  { id: "hc-5", endpoint_id: "ep-7", status: "down", response_time_ms: 0, status_code: 503, checked_at: "2025-01-25T10:00:00Z" },
];

export function listEndpoints(service_id?: string, status?: HealthStatus): Endpoint[] {
  let result = [...endpoints];
  if (service_id) result = result.filter((e) => e.service_id === service_id);
  if (status) result = result.filter((e) => e.status === status);
  return result.sort((a, b) => a.uptime_pct - b.uptime_pct);
}

export function getEndpoint(id: string): Endpoint | null {
  return endpoints.find((e) => e.id === id) || null;
}

export function createEndpoint(service_id: string, method: HttpMethod, path: string): Endpoint {
  const ep: Endpoint = {
    id: `ep-${nextId++}`,
    service_id,
    method,
    path,
    status: "unknown",
    response_time_ms: 0,
    uptime_pct: 0,
    last_checked: "",
    error_rate_pct: 0,
    requests_per_minute: 0,
  };
  endpoints.push(ep);
  return ep;
}

export function recordCheck(endpoint_id: string, status_code: number, response_time_ms: number): HealthCheck | null {
  const ep = endpoints.find((e) => e.id === endpoint_id);
  if (!ep) return null;
  let status: HealthStatus = "healthy";
  if (status_code >= 500) status = "down";
  else if (response_time_ms > 500) status = "degraded";
  const check: HealthCheck = { id: `hc-${nextCheckId++}`, endpoint_id, status, response_time_ms, status_code, checked_at: new Date().toISOString() };
  checks.push(check);
  ep.status = status;
  ep.response_time_ms = response_time_ms;
  ep.last_checked = check.checked_at;
  return check;
}

export function endpointChecks(endpoint_id: string): HealthCheck[] {
  return checks.filter((c) => c.endpoint_id === endpoint_id).sort((a, b) => b.checked_at.localeCompare(a.checked_at));
}

export function deleteEndpoint(id: string): boolean {
  const idx = endpoints.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  endpoints.splice(idx, 1);
  return true;
}

export function apiHealthSummary() {
  const total = endpoints.length;
  const by_status: Record<string, number> = {};
  endpoints.forEach((e) => { by_status[e.status] = (by_status[e.status] || 0) + 1; });
  const avg_response = endpoints.filter((e) => e.response_time_ms > 0).length
    ? Math.round(endpoints.filter((e) => e.response_time_ms > 0).reduce((s, e) => s + e.response_time_ms, 0) / endpoints.filter((e) => e.response_time_ms > 0).length)
    : 0;
  const avg_uptime = endpoints.filter((e) => e.uptime_pct > 0).length
    ? Math.round(endpoints.filter((e) => e.uptime_pct > 0).reduce((s, e) => s + e.uptime_pct, 0) / endpoints.filter((e) => e.uptime_pct > 0).length * 100) / 100
    : 0;
  return { total, by_status, avg_response_ms: avg_response, avg_uptime };
}
