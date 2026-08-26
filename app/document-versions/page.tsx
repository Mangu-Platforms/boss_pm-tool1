"use client";

import { useEffect, useState } from "react";

type DocSummary = { document_id: string; title: string; latest_version: number; last_author: string };
type Version = { id: string; version: number; title: string; author: string; change_summary: string; created_at: string };

export default function DocumentVersionsPage() {
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    fetch("/api/document-versions?list").then((r) => r.json()).then(setDocs);
  }, []);

  function selectDoc(id: string) {
    setSelectedDoc(id);
    fetch(`/api/document-versions?document_id=${id}`).then((r) => r.json()).then(setVersions);
  }

  return (
    <div className="page">
      <h1>Document Versions</h1>

      <div className="dv-layout">
        <div className="dv-docs">
          <h2>Documents</h2>
          {docs.map((d) => (
            <div key={d.document_id} className={`dv-doc ${selectedDoc === d.document_id ? "dv-doc-active" : ""}`} onClick={() => selectDoc(d.document_id)}>
              <div className="dv-doc-title">{d.title}</div>
              <div className="dv-doc-meta">v{d.latest_version} by {d.last_author}</div>
            </div>
          ))}
        </div>

        <div className="dv-versions">
          {selectedDoc ? (
            <>
              <h2>Version History</h2>
              {versions.map((v) => (
                <div key={v.id} className="dv-version">
                  <div className="dv-ver-header">
                    <span className="dv-ver-num">v{v.version}</span>
                    <span className="dv-ver-author">{v.author}</span>
                    <span className="dv-ver-date">{new Date(v.created_at).toLocaleDateString()}</span>
                  </div>
                  {v.change_summary && <p className="dv-ver-summary">{v.change_summary}</p>}
                </div>
              ))}
            </>
          ) : (
            <p className="dv-empty">Select a document to view versions</p>
          )}
        </div>
      </div>
    </div>
  );
}
