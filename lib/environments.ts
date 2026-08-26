export type EnvStatus = "active" | "inactive" | "deploying" | "failed";

export type Environment = {
  id: string;
  name: string;
  url: string;
  branch: string;
  status: EnvStatus;
  last_deployed_at: string | null;
  created_at: string;
};

const environments: Environment[] = [
  { id: "env-prod", name: "Production", url: "https://app.example.com", branch: "main", status: "active", last_deployed_at: "2025-03-10T08:00:00.000Z", created_at: "2025-01-01T00:00:00.000Z" },
  { id: "env-staging", name: "Staging", url: "https://staging.example.com", branch: "develop", status: "active", last_deployed_at: "2025-03-10T06:00:00.000Z", created_at: "2025-01-01T00:00:00.000Z" },
  { id: "env-dev", name: "Development", url: "https://dev.example.com", branch: "develop", status: "active", last_deployed_at: "2025-03-09T18:00:00.000Z", created_at: "2025-01-01T00:00:00.000Z" },
  { id: "env-qa", name: "QA", url: "https://qa.example.com", branch: "release/1.5", status: "deploying", last_deployed_at: "2025-03-10T07:00:00.000Z", created_at: "2025-02-01T00:00:00.000Z" },
];

export function listEnvironments(): Environment[] {
  return [...environments];
}

export function getEnvironment(id: string): Environment | null {
  return environments.find((e) => e.id === id) || null;
}

export function createEnvironment(name: string, url: string, branch: string): Environment {
  const env: Environment = {
    id: `env-${crypto.randomUUID().slice(0, 8)}`,
    name,
    url,
    branch,
    status: "inactive",
    last_deployed_at: null,
    created_at: new Date().toISOString(),
  };
  environments.push(env);
  return env;
}

export function updateEnvironmentStatus(id: string, status: EnvStatus): Environment | null {
  const env = environments.find((e) => e.id === id);
  if (!env) return null;
  env.status = status;
  if (status === "active") env.last_deployed_at = new Date().toISOString();
  return env;
}

export function deleteEnvironment(id: string): boolean {
  const idx = environments.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  environments.splice(idx, 1);
  return true;
}
