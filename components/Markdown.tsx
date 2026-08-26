"use client";

import { renderMarkdown } from "@/lib/markdown";

export function Markdown({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div
      className="md-body"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
    />
  );
}
