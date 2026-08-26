import { describe, it, expect } from "vitest";
import { versionsForDocument, getVersion, latestVersion, createVersion, compareVersions, documentList } from "../lib/document-versions";

describe("document-versions", () => {
  it("lists versions for document", () => {
    const versions = versionsForDocument("doc-1");
    expect(versions.length).toBeGreaterThanOrEqual(3);
  });

  it("returns newest version first", () => {
    const versions = versionsForDocument("doc-1");
    expect(versions[0].version).toBeGreaterThan(versions[versions.length - 1].version);
  });

  it("gets latest version", () => {
    const v = latestVersion("doc-1");
    expect(v).not.toBeNull();
    expect(v!.version).toBe(3);
  });

  it("creates new version", () => {
    const v = createVersion("doc-1", "Architecture Overview", "New content", "max", "Major rewrite");
    expect(v.version).toBe(4);
  });

  it("compares versions", () => {
    const result = compareVersions("docver-1", "docver-2");
    expect(result.v1).not.toBeNull();
    expect(result.v2).not.toBeNull();
    expect(result.same_content).toBe(false);
  });

  it("lists all documents", () => {
    const docs = documentList();
    expect(docs.length).toBeGreaterThanOrEqual(3);
    docs.forEach((d) => {
      expect(d.latest_version).toBeGreaterThan(0);
    });
  });
});
