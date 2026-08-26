export type Attachment = {
  id: string;
  issue_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  url: string;
  uploaded_by: string;
  created_at: string;
};

const store: Attachment[] = [
  { id: "att-1", issue_id: "BOSS-1", filename: "api-spec.yaml", content_type: "application/yaml", size_bytes: 15360, url: "/files/api-spec.yaml", uploaded_by: "alice", created_at: "2025-03-08T10:30:00.000Z" },
  { id: "att-2", issue_id: "BOSS-2", filename: "dashboard-mockup.png", content_type: "image/png", size_bytes: 245760, url: "/files/dashboard-mockup.png", uploaded_by: "carol", created_at: "2025-03-09T09:30:00.000Z" },
];

export function listAllAttachments(): Attachment[] {
  return [...store].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function listAttachments(issueId: string): Attachment[] {
  return store.filter((a) => a.issue_id === issueId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function addAttachment(
  issueId: string,
  filename: string,
  contentType: string,
  sizeBytes: number,
  url: string,
  uploadedBy: string
): Attachment {
  const attachment: Attachment = {
    id: crypto.randomUUID(),
    issue_id: issueId,
    filename,
    content_type: contentType,
    size_bytes: sizeBytes,
    url,
    uploaded_by: uploadedBy,
    created_at: new Date().toISOString(),
  };
  store.push(attachment);
  return attachment;
}

export function removeAttachment(id: string): boolean {
  const idx = store.findIndex((a) => a.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

export function getAttachment(id: string): Attachment | null {
  return store.find((a) => a.id === id) || null;
}

export function attachmentCount(issueId: string): number {
  return store.filter((a) => a.issue_id === issueId).length;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
