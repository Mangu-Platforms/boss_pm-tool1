export type ServiceStatus = "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";

export type Service = {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  uptime_percent: number;
  updated_at: string;
};

export type Incident = {
  id: string;
  title: string;
  service_id: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical";
  updates: { message: string; timestamp: string }[];
  created_at: string;
  resolved_at: string | null;
};

const services: Service[] = [
  { id: "svc-api", name: "API", description: "Core REST API endpoints", status: "operational", uptime_percent: 99.97, updated_at: "2025-03-10T00:00:00.000Z" },
  { id: "svc-web", name: "Web App", description: "Main web application", status: "operational", uptime_percent: 99.95, updated_at: "2025-03-10T00:00:00.000Z" },
  { id: "svc-db", name: "Database", description: "Primary database cluster", status: "operational", uptime_percent: 99.99, updated_at: "2025-03-10T00:00:00.000Z" },
  { id: "svc-ci", name: "CI/CD", description: "Build and deployment pipeline", status: "degraded", uptime_percent: 98.5, updated_at: "2025-03-09T00:00:00.000Z" },
  { id: "svc-cdn", name: "CDN", description: "Static asset delivery", status: "operational", uptime_percent: 99.98, updated_at: "2025-03-10T00:00:00.000Z" },
];

const incidents: Incident[] = [
  {
    id: "inc-1",
    title: "CI/CD build delays",
    service_id: "svc-ci",
    status: "monitoring",
    severity: "minor",
    updates: [
      { message: "Investigating slow build times", timestamp: "2025-03-09T14:00:00.000Z" },
      { message: "Identified: runner pool at capacity. Scaling up.", timestamp: "2025-03-09T14:30:00.000Z" },
      { message: "New runners deployed. Monitoring.", timestamp: "2025-03-09T15:00:00.000Z" },
    ],
    created_at: "2025-03-09T14:00:00.000Z",
    resolved_at: null,
  },
];

export function listServices(): Service[] {
  return [...services];
}

export function getService(id: string): Service | null {
  return services.find((s) => s.id === id) || null;
}

export function updateServiceStatus(id: string, status: ServiceStatus): Service | null {
  const svc = services.find((s) => s.id === id);
  if (!svc) return null;
  svc.status = status;
  svc.updated_at = new Date().toISOString();
  return svc;
}

export function listIncidents(serviceId?: string): Incident[] {
  let items = [...incidents];
  if (serviceId) items = items.filter((i) => i.service_id === serviceId);
  return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function createIncident(title: string, serviceId: string, severity: Incident["severity"]): Incident {
  const inc: Incident = {
    id: `inc-${crypto.randomUUID().slice(0, 8)}`,
    title,
    service_id: serviceId,
    status: "investigating",
    severity,
    updates: [{ message: "Investigating the issue", timestamp: new Date().toISOString() }],
    created_at: new Date().toISOString(),
    resolved_at: null,
  };
  incidents.push(inc);
  return inc;
}

export function addIncidentUpdate(incidentId: string, message: string): Incident | null {
  const inc = incidents.find((i) => i.id === incidentId);
  if (!inc) return null;
  inc.updates.push({ message, timestamp: new Date().toISOString() });
  return inc;
}

export function resolveIncident(incidentId: string): Incident | null {
  const inc = incidents.find((i) => i.id === incidentId);
  if (!inc) return null;
  inc.status = "resolved";
  inc.resolved_at = new Date().toISOString();
  inc.updates.push({ message: "Incident resolved", timestamp: new Date().toISOString() });
  return inc;
}

export function overallStatus(): ServiceStatus {
  if (services.some((s) => s.status === "major_outage")) return "major_outage";
  if (services.some((s) => s.status === "partial_outage")) return "partial_outage";
  if (services.some((s) => s.status === "degraded")) return "degraded";
  if (services.some((s) => s.status === "maintenance")) return "maintenance";
  return "operational";
}
