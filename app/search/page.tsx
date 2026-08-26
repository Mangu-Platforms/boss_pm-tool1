"use client";

import Link from "next/link";
import { useState } from "react";

type SearchResult = {
  id: string;
  type: "issue" | "product";
  title: string;
  status?: string;
  priority?: string;
  product_name?: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
    const data = await res.json();
    setResults(data.results || []);
    setSearched(true);
    setLoading(false);
  }

  return (
    <main>
      <div className="kicker">Find</div>
      <h1>Search</h1>
      <p className="lede">Search across all issues and products.</p>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          className="search-input"
          placeholder="Search issues, products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button className="go" type="submit" disabled={!query.trim() || loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {searched && (
        <div className="search-results">
          {results.length === 0 ? (
            <p className="empty">No results found for &ldquo;{query}&rdquo;</p>
          ) : (
            <>
              <p className="hint" style={{ marginBottom: 12 }}>{results.length} result{results.length !== 1 ? "s" : ""}</p>
              <div className="search-list">
                {results.map((r) => (
                  <Link
                    key={r.id}
                    href={r.type === "issue" ? `/issues/${r.id}` : `/products/${r.id}`}
                    className="search-item"
                  >
                    <span className="search-type">{r.type}</span>
                    <span className="search-title">{r.title}</span>
                    {r.status && <span className={`status ${r.status}`}>{r.status}</span>}
                    {r.priority && <span className={`priority ${r.priority}`}>{r.priority}</span>}
                    {r.product_name && <span className="hint">{r.product_name}</span>}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
