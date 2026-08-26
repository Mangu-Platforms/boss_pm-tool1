import { listIssues } from "./store";
import { listProducts } from "./store";
import { listMilestones } from "./milestones";

export type ExportFormat = "json" | "csv";

export function exportIssues(format: ExportFormat): string {
  const issues = listIssues();
  if (format === "csv") {
    const headers = "id,title,status,priority,assignee_user,due_on";
    const rows = issues.map((i) =>
      `"${i.id}","${i.title}","${i.status}","${i.priority}","${i.assignee_user || ""}","${i.due_on || ""}"`
    );
    return [headers, ...rows].join("\n");
  }
  return JSON.stringify({ issues, exported_at: new Date().toISOString() }, null, 2);
}

export function exportProducts(format: ExportFormat): string {
  const products = listProducts();
  if (format === "csv") {
    const headers = "slug,name,engine_tag,github_owner";
    const rows = products.map((p) =>
      `"${p.slug}","${p.name}","${p.engine_tag}","${p.github_owner}"`
    );
    return [headers, ...rows].join("\n");
  }
  return JSON.stringify({ products, exported_at: new Date().toISOString() }, null, 2);
}

export function exportMilestones(format: ExportFormat): string {
  const milestones = listMilestones();
  if (format === "csv") {
    const headers = "id,name,status,due_on";
    const rows = milestones.map((m) =>
      `"${m.id}","${m.name}","${m.status}","${m.due_on || ""}"`
    );
    return [headers, ...rows].join("\n");
  }
  return JSON.stringify({ milestones, exported_at: new Date().toISOString() }, null, 2);
}

export type ImportResult = {
  success: number;
  errors: string[];
};

export function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { values.push(cur); cur = ""; continue; }
      cur += ch;
    }
    values.push(cur);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (values[i] || "").trim(); });
    return row;
  });
}
