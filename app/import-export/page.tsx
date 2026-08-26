"use client";

import { useState } from "react";

export default function ImportExportPage() {
  const [exportType, setExportType] = useState("issues");
  const [exportFormat, setExportFormat] = useState("json");
  const [preview, setPreview] = useState("");

  async function handlePreview() {
    const params = `?format=${exportFormat}`;
    const url = exportFormat === "csv" ? `/api/export${params}` : `/api/export${params}`;
    const res = await fetch(url);
    if (exportFormat === "csv") {
      const text = await res.text();
      setPreview(text);
    } else {
      const data = await res.json();
      setPreview(JSON.stringify(data, null, 2));
    }
  }

  return (
    <main>
      <div className="kicker">Data</div>
      <h1>Import / Export</h1>
      <p className="lede">Export your project data in JSON or CSV format.</p>

      <h2 className="section-title">Export</h2>
      <div className="ie-controls">
        <select value={exportType} onChange={(e) => setExportType(e.target.value)}>
          <option value="issues">Issues</option>
          <option value="products">Products</option>
        </select>
        <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
        <button className="go" onClick={handlePreview}>Preview</button>
      </div>

      {preview && (
        <div className="ie-preview">
          <h3 className="section-title">Preview</h3>
          <pre className="ie-data">{preview}</pre>
        </div>
      )}
    </main>
  );
}
