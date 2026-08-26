"use client";

import { useEffect, useState } from "react";

type KBArticle = {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  author: string;
  tags: string[];
  views: number;
  helpful_count: number;
  updated_at: string;
};

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [popular, setPopular] = useState<KBArticle[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");

  useEffect(() => {
    fetch("/api/knowledge-base?popular&limit=5").then((r) => r.json()).then(setPopular);
  }, []);

  useEffect(() => {
    if (search) {
      fetch(`/api/knowledge-base?q=${encodeURIComponent(search)}`).then((r) => r.json()).then(setArticles);
    } else {
      const q = catFilter ? `?category=${catFilter}` : "";
      fetch(`/api/knowledge-base${q}`).then((r) => r.json()).then(setArticles);
    }
  }, [search, catFilter]);

  return (
    <div className="page">
      <h1>Knowledge Base</h1>

      <div className="kb-search">
        <input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="kb-search-input" />
      </div>

      {!search && (
        <div className="kb-popular">
          <h3>Popular Articles</h3>
          <div className="kb-pop-grid">
            {popular.map((a) => (
              <div key={a.id} className="kb-pop-card">
                <span className="kb-pop-title">{a.title}</span>
                <span className="kb-pop-views">{a.views} views</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rc-filters">
        {["", "guide", "tutorial", "faq", "troubleshooting", "reference"].map((c) => (
          <button key={c} className={`rc-filter-btn ${catFilter === c ? "rc-filter-active" : ""}`} onClick={() => { setCatFilter(c); setSearch(""); }}>{c || "All"}</button>
        ))}
      </div>

      <div className="kb-list">
        {articles.map((a) => (
          <div key={a.id} className="kb-article">
            <div className="kb-article-header">
              <span className="kb-article-title">{a.title}</span>
              <span className="kb-article-cat">{a.category}</span>
            </div>
            <div className="kb-article-excerpt">{a.content.slice(0, 120)}...</div>
            <div className="kb-article-meta">
              <span>{a.author}</span>
              <span>{a.views} views</span>
              <span>{a.helpful_count} helpful</span>
              {a.tags.map((t) => <span key={t} className="rc-feature-tag">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
