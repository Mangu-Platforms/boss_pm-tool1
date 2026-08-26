export type FlagEnvironment = "development" | "staging" | "production";
export type FlagStrategy = "boolean" | "percentage" | "user_list";

export type FeatureFlag = {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  strategy: FlagStrategy;
  percentage: number | null;
  user_list: string[];
  environments: FlagEnvironment[];
  owner: string;
  created_at: string;
  updated_at: string;
};

const flags: FeatureFlag[] = [
  { id: "ff-1", key: "new_dashboard", name: "New Dashboard", description: "Redesigned dashboard layout", enabled: true, strategy: "percentage", percentage: 50, user_list: [], environments: ["development", "staging"], owner: "max", created_at: "2025-07-01T00:00:00Z", updated_at: "2025-08-01T00:00:00Z" },
  { id: "ff-2", key: "ai_triage", name: "AI Issue Triage", description: "Automatic issue categorization", enabled: true, strategy: "user_list", percentage: null, user_list: ["max", "sami"], environments: ["development"], owner: "sami", created_at: "2025-08-01T00:00:00Z", updated_at: "2025-08-15T00:00:00Z" },
  { id: "ff-3", key: "dark_mode_v2", name: "Dark Mode V2", description: "New dark theme", enabled: false, strategy: "boolean", percentage: null, user_list: [], environments: ["development", "staging", "production"], owner: "priya", created_at: "2025-06-15T00:00:00Z", updated_at: "2025-06-15T00:00:00Z" },
  { id: "ff-4", key: "bulk_import", name: "Bulk Import", description: "CSV/JSON bulk import", enabled: true, strategy: "boolean", percentage: null, user_list: [], environments: ["development", "staging", "production"], owner: "carlos", created_at: "2025-05-01T00:00:00Z", updated_at: "2025-07-20T00:00:00Z" },
];

let nextId = 5;

export function listFlags(env?: FlagEnvironment): FeatureFlag[] {
  let result = [...flags];
  if (env) result = result.filter((f) => f.environments.includes(env));
  return result.sort((a, b) => a.key.localeCompare(b.key));
}

export function getFlag(id: string): FeatureFlag | null {
  return flags.find((f) => f.id === id) || null;
}

export function getFlagByKey(key: string): FeatureFlag | null {
  return flags.find((f) => f.key === key) || null;
}

export function createFlag(key: string, name: string, description: string, strategy: FlagStrategy, owner: string): FeatureFlag {
  const now = new Date().toISOString();
  const flag: FeatureFlag = {
    id: `ff-${nextId++}`,
    key,
    name,
    description,
    enabled: false,
    strategy,
    percentage: strategy === "percentage" ? 0 : null,
    user_list: [],
    environments: ["development"],
    owner,
    created_at: now,
    updated_at: now,
  };
  flags.push(flag);
  return flag;
}

export function updateFlag(id: string, updates: Partial<Pick<FeatureFlag, "enabled" | "strategy" | "percentage" | "user_list" | "environments" | "name" | "description">>): FeatureFlag | null {
  const flag = flags.find((f) => f.id === id);
  if (!flag) return null;
  Object.assign(flag, updates, { updated_at: new Date().toISOString() });
  return flag;
}

export function deleteFlag(id: string): boolean {
  const idx = flags.findIndex((f) => f.id === id);
  if (idx < 0) return false;
  flags.splice(idx, 1);
  return true;
}

export function evaluateFlag(key: string, userId: string): boolean {
  const flag = getFlagByKey(key);
  if (!flag || !flag.enabled) return false;
  switch (flag.strategy) {
    case "boolean": return true;
    case "percentage": return flag.percentage !== null && (hashCode(userId + key) % 100) < flag.percentage;
    case "user_list": return flag.user_list.includes(userId);
    default: return false;
  }
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
