"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EngineTag } from "@/lib/types";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [engineTag, setEngineTag] = useState<EngineTag>("lab");
  const [githubRepo, setGithubRepo] = useState("");
  const [homepage, setHomepage] = useState("");
  const [moneyNote, setMoneyNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function autoSlug(n: string) {
    return n
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function submit() {
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || autoSlug(name),
          engine_tag: engineTag,
          github_repo: githubRepo.trim() || null,
          homepage: homepage.trim() || null,
          money_note: moneyNote.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "create failed");
        return;
      }
      router.push(`/products/${data.product.slug}`);
    } catch {
      setErr("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <div className="kicker">New product</div>
      <h1>Add Product</h1>
      <p className="lede">Register a new product in the Mangu portfolio.</p>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          placeholder="Product name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slug) setSlug(autoSlug(e.target.value));
          }}
          autoComplete="off"
        />
        <input
          placeholder="Slug (auto-generated)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          autoComplete="off"
        />
        <div className="row">
          <label>
            <div className="hint">Engine tag</div>
            <select value={engineTag} onChange={(e) => setEngineTag(e.target.value as EngineTag)}>
              <option value="cash-engine">Cash Engine</option>
              <option value="lab">Lab</option>
            </select>
          </label>
          <label>
            <div className="hint">GitHub repo (optional)</div>
            <input
              placeholder="repo-name"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
            />
          </label>
          <label>
            <div className="hint">Homepage URL (optional)</div>
            <input
              placeholder="https://..."
              value={homepage}
              onChange={(e) => setHomepage(e.target.value)}
            />
          </label>
          <div />
        </div>
        <textarea
          placeholder="Money note — what does this product earn or learn?"
          value={moneyNote}
          onChange={(e) => setMoneyNote(e.target.value)}
          rows={2}
        />
        <button className="go" disabled={submitting || !name.trim()} type="submit">
          {submitting ? "Creating..." : "Create Product"}
        </button>
        {err && <div className="err">{err}</div>}
      </form>
    </main>
  );
}
