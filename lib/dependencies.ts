export type DependencyType = "blocks" | "blocked_by" | "relates_to" | "duplicates";

export type Dependency = {
  id: string;
  source_id: string;
  target_id: string;
  type: DependencyType;
  created_at: string;
};

const store: Dependency[] = [
  { id: "dep-1", source_id: "BOSS-1", target_id: "BOSS-2", type: "blocks", created_at: "2025-03-01T00:00:00.000Z" },
  { id: "dep-2", source_id: "BOSS-3", target_id: "BOSS-1", type: "relates_to", created_at: "2025-03-02T00:00:00.000Z" },
  { id: "dep-3", source_id: "BOSS-4", target_id: "BOSS-5", type: "blocked_by", created_at: "2025-03-03T00:00:00.000Z" },
];

export function listAllDependencies(): Dependency[] {
  return [...store];
}

export function addDependency(sourceId: string, targetId: string, type: DependencyType): Dependency {
  const existing = store.find(
    (d) => d.source_id === sourceId && d.target_id === targetId && d.type === type
  );
  if (existing) return existing;

  const dep: Dependency = {
    id: crypto.randomUUID(),
    source_id: sourceId,
    target_id: targetId,
    type,
    created_at: new Date().toISOString(),
  };
  store.push(dep);
  return dep;
}

export function removeDependency(id: string): boolean {
  const idx = store.findIndex((d) => d.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function getDependencies(issueId: string): Dependency[] {
  return store.filter((d) => d.source_id === issueId || d.target_id === issueId);
}

export function getBlockers(issueId: string): string[] {
  const blockedBy = store.filter((d) => d.target_id === issueId && d.type === "blocks");
  const blocking = store.filter((d) => d.source_id === issueId && d.type === "blocked_by");
  return [...blockedBy.map((d) => d.source_id), ...blocking.map((d) => d.target_id)];
}

export function getBlocking(issueId: string): string[] {
  const blocks = store.filter((d) => d.source_id === issueId && d.type === "blocks");
  const blockedBy = store.filter((d) => d.target_id === issueId && d.type === "blocked_by");
  return [...blocks.map((d) => d.target_id), ...blockedBy.map((d) => d.source_id)];
}

export function isBlocked(issueId: string): boolean {
  return getBlockers(issueId).length > 0;
}

export function getDependencyGraph(): { nodes: string[]; edges: { from: string; to: string; type: DependencyType }[] } {
  const nodes = new Set<string>();
  const edges: { from: string; to: string; type: DependencyType }[] = [];

  for (const dep of store) {
    nodes.add(dep.source_id);
    nodes.add(dep.target_id);
    edges.push({ from: dep.source_id, to: dep.target_id, type: dep.type });
  }

  return { nodes: [...nodes], edges };
}

export function detectCycle(sourceId: string, targetId: string): boolean {
  const visited = new Set<string>();
  const queue = [targetId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === sourceId) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    const outgoing = store
      .filter((d) => d.source_id === current && (d.type === "blocks" || d.type === "blocked_by"))
      .map((d) => d.target_id);
    queue.push(...outgoing);
  }

  return false;
}
