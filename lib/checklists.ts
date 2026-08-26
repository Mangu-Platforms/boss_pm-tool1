export type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
  position: number;
};

export type Checklist = {
  id: string;
  issue_id: string;
  title: string;
  items: ChecklistItem[];
  created_at: string;
};

const checklists: Checklist[] = [
  {
    id: "cl-1",
    issue_id: "BOSS-1",
    title: "Launch Checklist",
    items: [
      { id: "cli-1", text: "Write unit tests", checked: true, position: 0 },
      { id: "cli-2", text: "Update documentation", checked: false, position: 1 },
      { id: "cli-3", text: "Deploy to staging", checked: false, position: 2 },
      { id: "cli-4", text: "QA sign-off", checked: false, position: 3 },
    ],
    created_at: "2025-03-01T00:00:00.000Z",
  },
];

export function listChecklists(issueId?: string): Checklist[] {
  if (issueId) return checklists.filter((c) => c.issue_id === issueId).map((c) => ({ ...c, items: [...c.items] }));
  return checklists.map((c) => ({ ...c, items: [...c.items] }));
}

export function getChecklist(id: string): Checklist | null {
  const cl = checklists.find((c) => c.id === id);
  return cl ? { ...cl, items: [...cl.items] } : null;
}

export function createChecklist(issueId: string, title: string, items?: string[]): Checklist {
  const cl: Checklist = {
    id: `cl-${crypto.randomUUID().slice(0, 8)}`,
    issue_id: issueId,
    title,
    items: (items || []).map((text, i) => ({
      id: `cli-${crypto.randomUUID().slice(0, 8)}`,
      text,
      checked: false,
      position: i,
    })),
    created_at: new Date().toISOString(),
  };
  checklists.push(cl);
  return cl;
}

export function addChecklistItem(checklistId: string, text: string): Checklist | null {
  const cl = checklists.find((c) => c.id === checklistId);
  if (!cl) return null;
  cl.items.push({
    id: `cli-${crypto.randomUUID().slice(0, 8)}`,
    text,
    checked: false,
    position: cl.items.length,
  });
  return { ...cl, items: [...cl.items] };
}

export function toggleChecklistItem(checklistId: string, itemId: string): Checklist | null {
  const cl = checklists.find((c) => c.id === checklistId);
  if (!cl) return null;
  const item = cl.items.find((i) => i.id === itemId);
  if (!item) return null;
  item.checked = !item.checked;
  return { ...cl, items: [...cl.items] };
}

export function deleteChecklist(id: string): boolean {
  const idx = checklists.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  checklists.splice(idx, 1);
  return true;
}

export function checklistProgress(id: string): { total: number; checked: number; percent: number } {
  const cl = checklists.find((c) => c.id === id);
  if (!cl || cl.items.length === 0) return { total: 0, checked: 0, percent: 0 };
  const checked = cl.items.filter((i) => i.checked).length;
  return { total: cl.items.length, checked, percent: Math.round((checked / cl.items.length) * 100) };
}
