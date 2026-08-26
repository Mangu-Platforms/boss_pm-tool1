export type DecisionStatus = "proposed" | "accepted" | "rejected" | "superseded";

export type Decision = {
  id: string;
  title: string;
  context: string;
  decision: string;
  consequences: string;
  status: DecisionStatus;
  author: string;
  participants: string[];
  created_at: string;
  decided_at: string | null;
};

const store: Decision[] = [
  {
    id: "adr-001",
    title: "Use Next.js App Router",
    context: "Need a full-stack framework with good DX and performance",
    decision: "Adopt Next.js 15 with App Router for the entire frontend and API layer",
    consequences: "Locked into Vercel ecosystem for deployment, but gain SSR/SSG flexibility and excellent TypeScript support",
    status: "accepted",
    author: "Max",
    participants: ["Max", "Alice", "Bob"],
    created_at: "2025-01-05T00:00:00.000Z",
    decided_at: "2025-01-07T00:00:00.000Z",
  },
  {
    id: "adr-002",
    title: "In-memory store for MVP",
    context: "Need fast iteration without database overhead during early development",
    decision: "Use TypeScript in-memory arrays as the data layer, with clear module boundaries for future DB migration",
    consequences: "Data resets on restart; acceptable for MVP. Migration path is clear due to repository pattern.",
    status: "accepted",
    author: "Max",
    participants: ["Max", "Alice"],
    created_at: "2025-01-05T00:00:00.000Z",
    decided_at: "2025-01-06T00:00:00.000Z",
  },
  {
    id: "adr-003",
    title: "Monorepo vs separate packages",
    context: "Evaluating whether to split frontend/backend or keep as single project",
    decision: "Keep as single Next.js project with lib/ modules serving as the backend layer",
    consequences: "Simpler deployment and development, but may need splitting at scale",
    status: "accepted",
    author: "Alice",
    participants: ["Max", "Alice", "Bob"],
    created_at: "2025-01-08T00:00:00.000Z",
    decided_at: "2025-01-10T00:00:00.000Z",
  },
];

export function listDecisions(): Decision[] {
  return [...store].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getDecision(id: string): Decision | null {
  return store.find((d) => d.id === id) || null;
}

export function createDecision(
  title: string,
  context: string,
  decision: string,
  consequences: string,
  author = "operator",
  participants: string[] = []
): Decision {
  const num = store.length + 1;
  const d: Decision = {
    id: `adr-${String(num).padStart(3, "0")}`,
    title: title.trim(),
    context,
    decision,
    consequences,
    status: "proposed",
    author,
    participants: participants.length ? participants : [author],
    created_at: new Date().toISOString(),
    decided_at: null,
  };
  store.push(d);
  return d;
}

export function updateDecisionStatus(id: string, status: DecisionStatus): Decision | null {
  const d = store.find((dec) => dec.id === id);
  if (!d) return null;
  d.status = status;
  if (status === "accepted" || status === "rejected") {
    d.decided_at = new Date().toISOString();
  }
  return d;
}

export function updateDecision(id: string, updates: Partial<Pick<Decision, "title" | "context" | "decision" | "consequences" | "participants">>): Decision | null {
  const d = store.find((dec) => dec.id === id);
  if (!d) return null;
  if (updates.title !== undefined) d.title = updates.title;
  if (updates.context !== undefined) d.context = updates.context;
  if (updates.decision !== undefined) d.decision = updates.decision;
  if (updates.consequences !== undefined) d.consequences = updates.consequences;
  if (updates.participants !== undefined) d.participants = updates.participants;
  return d;
}

export function deleteDecision(id: string): boolean {
  const idx = store.findIndex((d) => d.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}
