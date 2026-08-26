export type ExperimentStatus = "draft" | "running" | "paused" | "concluded";
export type VariantType = "control" | "treatment";

export type Variant = {
  id: string;
  name: string;
  type: VariantType;
  allocation: number;
  conversions: number;
  impressions: number;
};

export type Experiment = {
  id: string;
  name: string;
  hypothesis: string;
  status: ExperimentStatus;
  metric: string;
  owner: string;
  variants: Variant[];
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

const experiments: Experiment[] = [
  { id: "exp-1", name: "CTA Button Color", hypothesis: "Gold CTA increases clicks by 15%", status: "running", metric: "click_rate", owner: "max", variants: [{ id: "v-1", name: "Control", type: "control", allocation: 50, conversions: 120, impressions: 1000 }, { id: "v-2", name: "Gold Button", type: "treatment", allocation: 50, conversions: 145, impressions: 1000 }], start_date: "2025-08-01", end_date: null, created_at: "2025-07-25T00:00:00Z" },
  { id: "exp-2", name: "Onboarding Flow", hypothesis: "Simplified onboarding improves completion 20%", status: "concluded", metric: "completion_rate", owner: "priya", variants: [{ id: "v-3", name: "Control", type: "control", allocation: 50, conversions: 200, impressions: 500 }, { id: "v-4", name: "Short Flow", type: "treatment", allocation: 50, conversions: 280, impressions: 500 }], start_date: "2025-06-01", end_date: "2025-07-15", created_at: "2025-05-20T00:00:00Z" },
  { id: "exp-3", name: "Issue Form Layout", hypothesis: "Two-column form reduces time to create by 10%", status: "draft", metric: "time_to_create", owner: "sami", variants: [{ id: "v-5", name: "Control", type: "control", allocation: 50, conversions: 0, impressions: 0 }, { id: "v-6", name: "Two Column", type: "treatment", allocation: 50, conversions: 0, impressions: 0 }], start_date: null, end_date: null, created_at: "2025-08-20T00:00:00Z" },
];

let nextExpId = 4;
let nextVarId = 7;

export function listExperiments(status?: ExperimentStatus): Experiment[] {
  let result = [...experiments];
  if (status) result = result.filter((e) => e.status === status);
  return result.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getExperiment(id: string): Experiment | null {
  return experiments.find((e) => e.id === id) || null;
}

export function createExperiment(name: string, hypothesis: string, metric: string, owner: string): Experiment {
  const exp: Experiment = {
    id: `exp-${nextExpId++}`,
    name,
    hypothesis,
    status: "draft",
    metric,
    owner,
    variants: [
      { id: `v-${nextVarId++}`, name: "Control", type: "control", allocation: 50, conversions: 0, impressions: 0 },
      { id: `v-${nextVarId++}`, name: "Treatment", type: "treatment", allocation: 50, conversions: 0, impressions: 0 },
    ],
    start_date: null,
    end_date: null,
    created_at: new Date().toISOString(),
  };
  experiments.push(exp);
  return exp;
}

export function updateExperiment(id: string, updates: Partial<Pick<Experiment, "status" | "name" | "hypothesis">>): Experiment | null {
  const exp = experiments.find((e) => e.id === id);
  if (!exp) return null;
  if (updates.status === "running" && !exp.start_date) exp.start_date = new Date().toISOString().slice(0, 10);
  if (updates.status === "concluded" && !exp.end_date) exp.end_date = new Date().toISOString().slice(0, 10);
  Object.assign(exp, updates);
  return exp;
}

export function recordImpression(expId: string, variantId: string, converted: boolean): Experiment | null {
  const exp = experiments.find((e) => e.id === expId);
  if (!exp) return null;
  const variant = exp.variants.find((v) => v.id === variantId);
  if (!variant) return null;
  variant.impressions++;
  if (converted) variant.conversions++;
  return exp;
}

export function experimentResults(id: string): { winner: string | null; lift: number; significant: boolean } | null {
  const exp = experiments.find((e) => e.id === id);
  if (!exp || exp.variants.length < 2) return null;
  const control = exp.variants.find((v) => v.type === "control");
  const treatment = exp.variants.find((v) => v.type === "treatment");
  if (!control || !treatment) return null;
  const controlRate = control.impressions > 0 ? control.conversions / control.impressions : 0;
  const treatmentRate = treatment.impressions > 0 ? treatment.conversions / treatment.impressions : 0;
  const lift = controlRate > 0 ? ((treatmentRate - controlRate) / controlRate) * 100 : 0;
  const significant = control.impressions >= 100 && treatment.impressions >= 100;
  return {
    winner: treatmentRate > controlRate ? treatment.name : control.name,
    lift: Math.round(lift * 10) / 10,
    significant,
  };
}

export function deleteExperiment(id: string): boolean {
  const idx = experiments.findIndex((e) => e.id === id);
  if (idx < 0) return false;
  experiments.splice(idx, 1);
  return true;
}
