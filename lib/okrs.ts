export type KeyResult = {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
};

export type OKR = {
  id: string;
  objective: string;
  owner: string;
  quarter: string;
  status: "on_track" | "at_risk" | "off_track" | "achieved";
  key_results: KeyResult[];
  created_at: string;
};

const okrs: OKR[] = [
  {
    id: "okr-1",
    objective: "Improve platform reliability",
    owner: "alice",
    quarter: "Q1 2025",
    status: "on_track",
    key_results: [
      { id: "kr-1a", title: "Achieve 99.9% uptime", target: 99.9, current: 99.7, unit: "%" },
      { id: "kr-1b", title: "Reduce P1 incidents to under 3/month", target: 3, current: 4, unit: "incidents" },
      { id: "kr-1c", title: "Reduce mean time to recovery to under 30 min", target: 30, current: 45, unit: "minutes" },
    ],
    created_at: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "okr-2",
    objective: "Accelerate feature delivery",
    owner: "bob",
    quarter: "Q1 2025",
    status: "at_risk",
    key_results: [
      { id: "kr-2a", title: "Ship 15 features this quarter", target: 15, current: 8, unit: "features" },
      { id: "kr-2b", title: "Reduce cycle time to 5 days", target: 5, current: 7, unit: "days" },
    ],
    created_at: "2025-01-02T00:00:00.000Z",
  },
];

export function listOKRs(quarter?: string): OKR[] {
  let items = [...okrs];
  if (quarter) items = items.filter((o) => o.quarter === quarter);
  return items;
}

export function getOKR(id: string): OKR | null {
  return okrs.find((o) => o.id === id) || null;
}

export function createOKR(objective: string, owner: string, quarter: string, keyResults: { title: string; target: number; unit: string }[]): OKR {
  const okr: OKR = {
    id: `okr-${crypto.randomUUID().slice(0, 8)}`,
    objective,
    owner,
    quarter,
    status: "on_track",
    key_results: keyResults.map((kr) => ({
      id: `kr-${crypto.randomUUID().slice(0, 8)}`,
      title: kr.title,
      target: kr.target,
      current: 0,
      unit: kr.unit,
    })),
    created_at: new Date().toISOString(),
  };
  okrs.push(okr);
  return okr;
}

export function updateKeyResult(okrId: string, krId: string, current: number): OKR | null {
  const okr = okrs.find((o) => o.id === okrId);
  if (!okr) return null;
  const kr = okr.key_results.find((k) => k.id === krId);
  if (!kr) return null;
  kr.current = current;
  return okr;
}

export function updateOKRStatus(id: string, status: OKR["status"]): OKR | null {
  const okr = okrs.find((o) => o.id === id);
  if (!okr) return null;
  okr.status = status;
  return okr;
}

export function deleteOKR(id: string): boolean {
  const idx = okrs.findIndex((o) => o.id === id);
  if (idx === -1) return false;
  okrs.splice(idx, 1);
  return true;
}

export function okrProgress(id: string): number {
  const okr = okrs.find((o) => o.id === id);
  if (!okr || okr.key_results.length === 0) return 0;
  const progress = okr.key_results.reduce((sum, kr) => {
    return sum + Math.min(100, (kr.current / kr.target) * 100);
  }, 0);
  return Math.round(progress / okr.key_results.length);
}
