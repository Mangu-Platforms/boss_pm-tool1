import { describe, it, expect } from "vitest";
import { listAttachments, addAttachment, removeAttachment, getAttachment, attachmentCount, formatFileSize } from "@/lib/attachments";

describe("attachments", () => {
  it("starts empty for an issue", () => {
    expect(listAttachments("iss-empty")).toEqual([]);
  });

  it("adds an attachment", () => {
    const a = addAttachment("iss-att", "screenshot.png", "image/png", 204800, "https://cdn.example.com/screenshot.png", "user-max");
    expect(a.filename).toBe("screenshot.png");
    expect(a.size_bytes).toBe(204800);
  });

  it("lists attachments for issue", () => {
    addAttachment("iss-att2", "doc.pdf", "application/pdf", 512000, "https://cdn.example.com/doc.pdf", "user-max");
    expect(listAttachments("iss-att2").length).toBe(1);
  });

  it("removes an attachment", () => {
    const a = addAttachment("iss-rem", "file.txt", "text/plain", 100, "https://x.com/file.txt", "user-max");
    expect(removeAttachment(a.id)).toBe(true);
    expect(getAttachment(a.id)).toBeNull();
  });

  it("counts attachments", () => {
    addAttachment("iss-count", "a.png", "image/png", 1000, "u1", "user-max");
    addAttachment("iss-count", "b.png", "image/png", 2000, "u2", "user-max");
    expect(attachmentCount("iss-count")).toBe(2);
  });

  it("formats file size", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(1048576)).toBe("1.0 MB");
    expect(formatFileSize(5242880)).toBe("5.0 MB");
  });
});
