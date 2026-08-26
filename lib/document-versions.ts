export type DocumentVersion = {
  id: string;
  document_id: string;
  version: number;
  title: string;
  content: string;
  author: string;
  change_summary: string;
  created_at: string;
};

let nextId = 8;
function genId() { return `docver-${nextId++}`; }

const store: DocumentVersion[] = [
  { id: "docver-1", document_id: "doc-1", version: 1, title: "Architecture Overview", content: "Initial architecture doc", author: "max", change_summary: "Initial version", created_at: "2025-02-01T10:00:00Z" },
  { id: "docver-2", document_id: "doc-1", version: 2, title: "Architecture Overview", content: "Updated architecture with microservices", author: "max", change_summary: "Added microservices section", created_at: "2025-02-15T10:00:00Z" },
  { id: "docver-3", document_id: "doc-1", version: 3, title: "Architecture Overview", content: "Final architecture with API gateway", author: "alice", change_summary: "Added API gateway details", created_at: "2025-03-01T10:00:00Z" },
  { id: "docver-4", document_id: "doc-2", version: 1, title: "API Reference", content: "REST API endpoints", author: "bob", change_summary: "Initial API docs", created_at: "2025-02-20T10:00:00Z" },
  { id: "docver-5", document_id: "doc-2", version: 2, title: "API Reference", content: "REST API with auth endpoints", author: "bob", change_summary: "Added authentication", created_at: "2025-03-05T10:00:00Z" },
  { id: "docver-6", document_id: "doc-3", version: 1, title: "Deployment Guide", content: "How to deploy", author: "alice", change_summary: "Initial deployment guide", created_at: "2025-03-10T10:00:00Z" },
  { id: "docver-7", document_id: "doc-3", version: 2, title: "Deployment Guide", content: "How to deploy with CI/CD", author: "max", change_summary: "Added CI/CD pipeline", created_at: "2025-03-15T10:00:00Z" },
];

export function versionsForDocument(documentId: string): DocumentVersion[] {
  return store.filter((v) => v.document_id === documentId).sort((a, b) => b.version - a.version);
}

export function getVersion(id: string): DocumentVersion | null {
  return store.find((v) => v.id === id) || null;
}

export function latestVersion(documentId: string): DocumentVersion | null {
  const versions = versionsForDocument(documentId);
  return versions.length > 0 ? versions[0] : null;
}

export function createVersion(documentId: string, title: string, content: string, author: string, changeSummary: string): DocumentVersion {
  const existing = versionsForDocument(documentId);
  const nextVersion = existing.length > 0 ? existing[0].version + 1 : 1;
  const ver: DocumentVersion = { id: genId(), document_id: documentId, version: nextVersion, title, content, author, change_summary: changeSummary, created_at: new Date().toISOString() };
  store.push(ver);
  return ver;
}

export function compareVersions(id1: string, id2: string): { v1: DocumentVersion | null; v2: DocumentVersion | null; same_content: boolean } {
  const v1 = getVersion(id1);
  const v2 = getVersion(id2);
  return { v1, v2, same_content: v1 !== null && v2 !== null && v1.content === v2.content };
}

export function documentList(): { document_id: string; title: string; latest_version: number; last_author: string }[] {
  const docs: Record<string, DocumentVersion> = {};
  store.forEach((v) => {
    if (!docs[v.document_id] || v.version > docs[v.document_id].version) {
      docs[v.document_id] = v;
    }
  });
  return Object.entries(docs).map(([document_id, v]) => ({
    document_id, title: v.title, latest_version: v.version, last_author: v.author,
  }));
}
