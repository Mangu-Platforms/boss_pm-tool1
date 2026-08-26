export type DeploymentStatus = "pending" | "in_progress" | "success" | "failed" | "rolled_back";
export type DeploymentEnvironment = "development" | "staging" | "production";

export type Deployment = {
  id: string;
  service_id: string;
  version: string;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  deployer: string;
  commit_sha: string;
  duration_seconds: number | null;
  rollback_version: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
};

const deployments: Deployment[] = [
  { id: "dep-1", service_id: "svc-1", version: "2.3.1", environment: "production", status: "success", deployer: "max", commit_sha: "abc1234", duration_seconds: 180, rollback_version: null, started_at: "2025-08-24T10:00:00Z", completed_at: "2025-08-24T10:03:00Z", created_at: "2025-08-24T10:00:00Z" },
  { id: "dep-2", service_id: "svc-2", version: "1.8.0", environment: "staging", status: "success", deployer: "sami", commit_sha: "def5678", duration_seconds: 120, rollback_version: null, started_at: "2025-08-25T08:00:00Z", completed_at: "2025-08-25T08:02:00Z", created_at: "2025-08-25T08:00:00Z" },
  { id: "dep-3", service_id: "svc-3", version: "3.1.2", environment: "production", status: "failed", deployer: "priya", commit_sha: "ghi9012", duration_seconds: 45, rollback_version: "3.1.1", started_at: "2025-08-23T14:00:00Z", completed_at: "2025-08-23T14:00:45Z", created_at: "2025-08-23T14:00:00Z" },
  { id: "dep-4", service_id: "svc-1", version: "2.3.0", environment: "production", status: "rolled_back", deployer: "max", commit_sha: "jkl3456", duration_seconds: 200, rollback_version: "2.2.9", started_at: "2025-08-22T16:00:00Z", completed_at: "2025-08-22T16:03:20Z", created_at: "2025-08-22T16:00:00Z" },
  { id: "dep-5", service_id: "svc-4", version: "1.0.5", environment: "development", status: "in_progress", deployer: "carlos", commit_sha: "mno7890", duration_seconds: null, rollback_version: null, started_at: "2025-08-26T09:00:00Z", completed_at: null, created_at: "2025-08-26T09:00:00Z" },
];

let nextId = 6;

export function listDeployments(serviceId?: string, env?: DeploymentEnvironment): Deployment[] {
  let result = [...deployments];
  if (serviceId) result = result.filter((d) => d.service_id === serviceId);
  if (env) result = result.filter((d) => d.environment === env);
  return result.sort((a, b) => b.started_at.localeCompare(a.started_at));
}

export function getDeployment(id: string): Deployment | null {
  return deployments.find((d) => d.id === id) || null;
}

export function createDeployment(serviceId: string, version: string, env: DeploymentEnvironment, deployer: string, commitSha: string): Deployment {
  const now = new Date().toISOString();
  const dep: Deployment = { id: `dep-${nextId++}`, service_id: serviceId, version, environment: env, status: "pending", deployer, commit_sha: commitSha, duration_seconds: null, rollback_version: null, started_at: now, completed_at: null, created_at: now };
  deployments.push(dep);
  return dep;
}

export function updateDeployment(id: string, updates: Partial<Pick<Deployment, "status" | "rollback_version">>): Deployment | null {
  const dep = deployments.find((d) => d.id === id);
  if (!dep) return null;
  if (updates.status === "success" || updates.status === "failed" || updates.status === "rolled_back") {
    dep.completed_at = new Date().toISOString();
    dep.duration_seconds = Math.round((new Date(dep.completed_at).getTime() - new Date(dep.started_at).getTime()) / 1000);
  }
  Object.assign(dep, updates);
  return dep;
}

export function deploymentMetrics(env?: DeploymentEnvironment): { total: number; success_rate: number; avg_duration_seconds: number; failed: number } {
  const filtered = env ? deployments.filter((d) => d.environment === env) : deployments;
  const completed = filtered.filter((d) => d.status === "success" || d.status === "failed" || d.status === "rolled_back");
  const successes = completed.filter((d) => d.status === "success");
  const withDuration = completed.filter((d) => d.duration_seconds !== null);
  return {
    total: filtered.length,
    success_rate: completed.length > 0 ? Math.round((successes.length / completed.length) * 100) : 0,
    avg_duration_seconds: withDuration.length > 0 ? Math.round(withDuration.reduce((s, d) => s + d.duration_seconds!, 0) / withDuration.length) : 0,
    failed: completed.filter((d) => d.status === "failed" || d.status === "rolled_back").length,
  };
}
