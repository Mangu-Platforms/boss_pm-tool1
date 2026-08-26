export type RiskLevel = "critical" | "high" | "medium" | "low";
export type RiskStatus = "open" | "mitigating" | "mitigated" | "closed";

export type Risk = {
  id: string;
  title: string;
  description: string;
  likelihood: RiskLevel;
  impact: RiskLevel;
  status: RiskStatus;
  owner: string;
  mitigation: string;
  created_at: string;
  updated_at: string;
};

const store: Risk[] = [
  {
    id: "risk-vendor",
    title: "Vendor lock-in",
    description: "Over-reliance on a single cloud provider",
    likelihood: "medium",
    impact: "high",
    status: "mitigating",
    owner: "Max",
    mitigation: "Abstract cloud services behind interfaces, evaluate multi-cloud quarterly",
    created_at: "2025-01-10T00:00:00.000Z",
    updated_at: "2025-01-10T00:00:00.000Z",
  },
  {
    id: "risk-security",
    title: "Data breach",
    description: "Unauthorized access to customer data",
    likelihood: "low",
    impact: "critical",
    status: "mitigating",
    owner: "Alice",
    mitigation: "Regular pen testing, SOC 2 compliance, encryption at rest",
    created_at: "2025-01-12T00:00:00.000Z",
    updated_at: "2025-02-01T00:00:00.000Z",
  },
];

export function listRisks(): Risk[] {
  return [...store].sort((a, b) => riskScore(b) - riskScore(a));
}

export function getRisk(id: string): Risk | null {
  return store.find((r) => r.id === id) || null;
}

export function createRisk(
  title: string,
  description: string,
  likelihood: RiskLevel,
  impact: RiskLevel,
  owner = "operator",
  mitigation = ""
): Risk {
  const now = new Date().toISOString();
  const risk: Risk = {
    id: `risk-${crypto.randomUUID().slice(0, 8)}`,
    title: title.trim(),
    description,
    likelihood,
    impact,
    status: "open",
    owner,
    mitigation,
    created_at: now,
    updated_at: now,
  };
  store.push(risk);
  return risk;
}

export function updateRisk(id: string, updates: Partial<Pick<Risk, "title" | "description" | "likelihood" | "impact" | "status" | "owner" | "mitigation">>): Risk | null {
  const r = store.find((risk) => risk.id === id);
  if (!r) return null;
  if (updates.title !== undefined) r.title = updates.title;
  if (updates.description !== undefined) r.description = updates.description;
  if (updates.likelihood !== undefined) r.likelihood = updates.likelihood;
  if (updates.impact !== undefined) r.impact = updates.impact;
  if (updates.status !== undefined) r.status = updates.status;
  if (updates.owner !== undefined) r.owner = updates.owner;
  if (updates.mitigation !== undefined) r.mitigation = updates.mitigation;
  r.updated_at = new Date().toISOString();
  return r;
}

export function deleteRisk(id: string): boolean {
  const idx = store.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

const levelScores: Record<RiskLevel, number> = { critical: 4, high: 3, medium: 2, low: 1 };

export function riskScore(risk: Risk): number {
  return levelScores[risk.likelihood] * levelScores[risk.impact];
}

export function riskMatrix(): { level: string; count: number }[] {
  const matrix: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const r of store) {
    const score = riskScore(r);
    if (score >= 12) matrix.critical++;
    else if (score >= 6) matrix.high++;
    else if (score >= 3) matrix.medium++;
    else matrix.low++;
  }
  return Object.entries(matrix).map(([level, count]) => ({ level, count }));
}
