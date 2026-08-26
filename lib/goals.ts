export type Goal = {
  id: string;
  title: string;
  description: string;
  owner: string;
  status: "on_track" | "at_risk" | "behind" | "completed";
  target_date: string | null;
  progress: number;
  key_results: KeyResult[];
  created_at: string;
};

export type KeyResult = {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
};

const store: Goal[] = [
  {
    id: "goal-revenue",
    title: "Hit $100K MRR",
    description: "Grow monthly recurring revenue to $100K by Q4",
    owner: "Max",
    status: "on_track",
    target_date: "2025-12-31",
    progress: 45,
    key_results: [
      { id: "kr-1", title: "Paying customers", current: 85, target: 200, unit: "customers" },
      { id: "kr-2", title: "Average contract value", current: 520, target: 500, unit: "USD" },
      { id: "kr-3", title: "Churn rate below", current: 3.2, target: 5, unit: "%" },
    ],
    created_at: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "goal-product",
    title: "Ship v1.0",
    description: "Complete all core features for the v1.0 launch",
    owner: "Alice",
    status: "at_risk",
    target_date: "2025-06-30",
    progress: 68,
    key_results: [
      { id: "kr-4", title: "Features completed", current: 34, target: 50, unit: "features" },
      { id: "kr-5", title: "Test coverage", current: 72, target: 80, unit: "%" },
    ],
    created_at: "2025-01-15T00:00:00.000Z",
  },
];

export function listGoals(): Goal[] {
  return [...store];
}

export function getGoal(id: string): Goal | null {
  return store.find((g) => g.id === id) || null;
}

export function createGoal(
  title: string,
  description = "",
  owner = "operator",
  targetDate: string | null = null
): Goal {
  const goal: Goal = {
    id: `goal-${crypto.randomUUID().slice(0, 8)}`,
    title: title.trim(),
    description,
    owner,
    status: "on_track",
    target_date: targetDate,
    progress: 0,
    key_results: [],
    created_at: new Date().toISOString(),
  };
  store.push(goal);
  return goal;
}

export function updateGoal(id: string, updates: Partial<Pick<Goal, "title" | "description" | "status" | "progress" | "target_date" | "owner">>): Goal | null {
  const g = store.find((goal) => goal.id === id);
  if (!g) return null;
  if (updates.title !== undefined) g.title = updates.title;
  if (updates.description !== undefined) g.description = updates.description;
  if (updates.status !== undefined) g.status = updates.status;
  if (updates.progress !== undefined) g.progress = updates.progress;
  if (updates.target_date !== undefined) g.target_date = updates.target_date;
  if (updates.owner !== undefined) g.owner = updates.owner;
  return g;
}

export function deleteGoal(id: string): boolean {
  const idx = store.findIndex((g) => g.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function addKeyResult(goalId: string, title: string, target: number, unit: string): KeyResult | null {
  const g = store.find((goal) => goal.id === goalId);
  if (!g) return null;
  const kr: KeyResult = {
    id: `kr-${crypto.randomUUID().slice(0, 8)}`,
    title,
    current: 0,
    target,
    unit,
  };
  g.key_results.push(kr);
  recalcProgress(g);
  return kr;
}

export function updateKeyResult(goalId: string, krId: string, current: number): KeyResult | null {
  const g = store.find((goal) => goal.id === goalId);
  if (!g) return null;
  const kr = g.key_results.find((k) => k.id === krId);
  if (!kr) return null;
  kr.current = current;
  recalcProgress(g);
  return kr;
}

function recalcProgress(goal: Goal) {
  if (goal.key_results.length === 0) return;
  const total = goal.key_results.reduce((sum, kr) => {
    return sum + Math.min(100, (kr.current / kr.target) * 100);
  }, 0);
  goal.progress = Math.round(total / goal.key_results.length);
}
