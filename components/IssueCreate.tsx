"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { AgentName, CreateIssueInput, Issue, Product } from "@/lib/types";

type Props = {
  products: Product[];
  defaultProductId?: string;
  onCreated?: (issue: Issue) => void;
};

export function IssueCreate({ products, defaultProductId, onCreated }: Props) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [productId, setProductId] = useState(defaultProductId || products[0]?.id || "");
  const [kind, setKind] = useState<"user" | "agent">("agent");
  const [user, setUser] = useState("operator");
  const [agent, setAgent] = useState<AgentName>("alice");
  const [cap, setCap] = useState("2.00");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!productId && (defaultProductId || products[0]?.id)) {
      setProductId(defaultProductId || products[0].id);
    }
  }, [products, defaultProductId, productId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        titleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submit() {
    setErr(null);
    const cents = kind === "agent" ? Math.round(parseFloat(cap || "0") * 100) : null;
    const input: CreateIssueInput = {
      product_id: productId,
      title,
      assignee_kind: kind,
      assignee_user: kind === "user" ? user : null,
      agent_name: kind === "agent" ? agent : null,
      cost_cap_cents: cents,
    };
    const mark = performance.now();
    startTransition(async () => {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "create failed");
        return;
      }
      performance.measure("issue-create", { start: mark });
      setTitle("");
      onCreated?.(data.issue);
    });
  }

  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="kicker">Create · press C</div>
      <input
        ref={titleRef}
        placeholder="Issue title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoComplete="off"
      />
      <div className="row">
        <label>
          <div className="hint">Product</div>
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <div className="hint">Assignee</div>
          <select
            value={kind === "user" ? `user:${user}` : `agent:${agent}`}
            onChange={(e) => {
              const v = e.target.value;
              if (v.startsWith("agent:")) {
                setKind("agent");
                setAgent(v.slice(6) as AgentName);
              } else {
                setKind("user");
                setUser(v.slice(5));
              }
            }}
          >
            <option value="agent:alice">Alice (agent)</option>
            <option value="agent:swarm">Swarm (agent)</option>
            <option value="user:operator">operator (user)</option>
          </select>
        </label>
        <label>
          <div className="hint">Cost cap {kind === "agent" ? "(required)" : "(n/a)"}</div>
          <input
            inputMode="decimal"
            value={cap}
            disabled={kind !== "agent"}
            onChange={(e) => setCap(e.target.value)}
            placeholder="2.00"
          />
        </label>
        <button className="go" disabled={pending || !title.trim()} type="submit">
          {pending ? "…" : "Add"}
        </button>
      </div>
      {err ? <div className="err">{err}</div> : <div className="hint">Agent work needs a cap. Sync is one-way from GitHub.</div>}
    </form>
  );
}
