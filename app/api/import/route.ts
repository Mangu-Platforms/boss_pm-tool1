import { NextResponse } from "next/server";
import { createIssue, listProducts } from "@/lib/store";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  let rows: Record<string, string>[] = [];

  if (contentType.includes("application/json")) {
    const body = await req.json();
    rows = body.issues || [];
  } else if (contentType.includes("text/csv") || contentType.includes("multipart/form-data")) {
    const text = await req.text();
    rows = parseCsv(text);
  } else {
    return NextResponse.json({ error: "Unsupported content type. Use application/json or text/csv" }, { status: 400 });
  }

  if (!rows.length) {
    return NextResponse.json({ error: "No rows to import" }, { status: 400 });
  }

  const products = listProducts();
  const productMap = new Map(products.map((p) => [p.name.toLowerCase(), p.id]));
  productMap.set("default", products[0]?.id || "");

  const imported: string[] = [];
  const errors: { row: number; error: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const productId = resolveProduct(row.product || row.product_id || "", productMap, products[0]?.id);
      if (!productId) {
        errors.push({ row: i + 1, error: "No matching product found" });
        continue;
      }

      const issue = createIssue({
        product_id: productId,
        title: row.title || `Imported issue ${i + 1}`,
        body: row.body || row.description || "",
        priority: validPriority(row.priority),
        assignee_kind: row.assignee_kind === "agent" ? "agent" : "user",
        assignee_user: row.assignee_kind === "agent" ? null : (row.assignee || row.assignee_user || "operator"),
        agent_name: row.assignee_kind === "agent" ? (row.agent_name as "alice" | "swarm" || "alice") : null,
        cost_cap_cents: row.assignee_kind === "agent" ? Number(row.cost_cap_cents || 500) : null,
        due_on: row.due_on || null,
      });
      imported.push(issue.id);
    } catch (e: unknown) {
      errors.push({ row: i + 1, error: e instanceof Error ? e.message : "Unknown error" });
    }
  }

  return NextResponse.json({
    imported_count: imported.length,
    error_count: errors.length,
    imported_ids: imported,
    errors: errors.length > 0 ? errors : undefined,
  }, { status: imported.length > 0 ? 201 : 400 });
}

function validPriority(val?: string): "critical" | "high" | "medium" | "low" {
  const valid = ["critical", "high", "medium", "low"];
  return valid.includes(val || "") ? (val as "critical" | "high" | "medium" | "low") : "medium";
}

function resolveProduct(name: string, map: Map<string, string>, fallback?: string): string | undefined {
  if (!name) return fallback;
  const lower = name.toLowerCase();
  if (map.has(lower)) return map.get(lower);
  for (const [key, id] of map) {
    if (key.includes(lower) || lower.includes(key)) return id;
  }
  return fallback;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (vals[idx] || "").trim();
    });
    if (row.title) rows.push(row);
  }

  return rows;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
