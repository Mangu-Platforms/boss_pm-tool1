export type ApiKey = {
  id: string;
  name: string;
  key: string;
  prefix: string;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  active: boolean;
};

let nextId = 3;
function genId() { return `ak-${nextId++}`; }
function genKey() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "bpm_";
  for (let i = 0; i < 32; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

const store: ApiKey[] = [
  {
    id: "ak-1",
    name: "CI Pipeline",
    key: "bpm_ci1234567890abcdefghijklmnopqrs",
    prefix: "bpm_ci12...pqrs",
    scopes: ["read:issues", "write:issues", "read:products"],
    created_at: "2025-02-01T10:00:00Z",
    last_used_at: "2025-04-01T14:30:00Z",
    expires_at: "2026-02-01T10:00:00Z",
    active: true,
  },
  {
    id: "ak-2",
    name: "Dashboard Widget",
    key: "bpm_dw9876543210zyxwvutsrqponmlkji",
    prefix: "bpm_dw98...lkji",
    scopes: ["read:issues", "read:analytics"],
    created_at: "2025-03-01T08:00:00Z",
    last_used_at: null,
    expires_at: null,
    active: true,
  },
];

export function listApiKeys(): Omit<ApiKey, "key">[] {
  return store.map(({ key, ...rest }) => rest);
}

export function getApiKey(id: string): ApiKey | null {
  return store.find((k) => k.id === id) || null;
}

export function createApiKey(name: string, scopes: string[], expiresAt?: string): ApiKey {
  const key = genKey();
  const ak: ApiKey = {
    id: genId(),
    name,
    key,
    prefix: key.slice(0, 8) + "..." + key.slice(-4),
    scopes,
    created_at: new Date().toISOString(),
    last_used_at: null,
    expires_at: expiresAt || null,
    active: true,
  };
  store.push(ak);
  return ak;
}

export function revokeApiKey(id: string): boolean {
  const ak = store.find((k) => k.id === id);
  if (!ak) return false;
  ak.active = false;
  return true;
}

export function deleteApiKey(id: string): boolean {
  const idx = store.findIndex((k) => k.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function validateApiKey(keyStr: string): ApiKey | null {
  const ak = store.find((k) => k.key === keyStr && k.active);
  if (!ak) return null;
  if (ak.expires_at && new Date(ak.expires_at) < new Date()) return null;
  ak.last_used_at = new Date().toISOString();
  return ak;
}
