"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { EngineTag, Product } from "@/lib/types";

export default function BoardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [engine, setEngine] = useState<EngineTag | "all">("all");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  }, []);

  const shown = useMemo(
    () => products.filter((p) => engine === "all" || p.engine_tag === engine),
    [products, engine]
  );

  return (
    <main>
      <div className="kicker">Portfolio truth</div>
      <h1>All Mangu products</h1>
      <p className="lede">
        One board. Cash engines earn. Labs learn. Assign Alice or a swarm with a dollar cap. No Gantt.
      </p>
      <div className="claims">
        <div className="claim">
          <strong>1 · Instant UI</strong>
          <p>Optimistic create. Chambers tokens. Static shell. Cheaper laptop than Linear still feels immediate.</p>
        </div>
        <div className="claim">
          <strong>2 · Agent-native</strong>
          <p>Assignee is a user or an agent. Swarm requires a cost cap. Cap survives reload.</p>
        </div>
        <div className="claim">
          <strong>3 · Portfolio truth</strong>
          <p>Every tagged repo. Engine filter. GitHub state is the mirror for linked issues.</p>
        </div>
      </div>
      <div className="filters">
        {(["all", "cash-engine", "lab"] as const).map((v) => (
          <button key={v} className="chip" data-on={engine === v} onClick={() => setEngine(v)}>
            {v}
          </button>
        ))}
      </div>
      <div className="grid">
        {shown.map((p) => (
          <Link key={p.id} href={`/products/${p.slug}`} className="card">
            <span className={`tag ${p.engine_tag === "cash-engine" ? "engine" : "lab"}`}>{p.engine_tag}</span>
            <strong>{p.name}</strong>
            <span className="hint">{p.github_repo ? `${p.github_owner}/${p.github_repo}` : "no repo"}</span>
            <span className="money">{p.money_note}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
