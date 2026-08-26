import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("markdown renderer", () => {
  it("renders bold text", () => {
    expect(renderMarkdown("**hello**")).toContain("<strong>hello</strong>");
  });

  it("renders italic text", () => {
    expect(renderMarkdown("*world*")).toContain("<em>world</em>");
  });

  it("renders inline code", () => {
    expect(renderMarkdown("`code`")).toContain('<code class="md-code">code</code>');
  });

  it("renders headings", () => {
    const h = renderMarkdown("# Title");
    expect(h).toContain('<h2 class="md-h">Title</h2>');
  });

  it("renders links", () => {
    const link = renderMarkdown("[click](https://example.com)");
    expect(link).toContain('href="https://example.com"');
    expect(link).toContain(">click</a>");
  });

  it("renders code blocks", () => {
    const cb = renderMarkdown("```js\nconst x = 1;\n```");
    expect(cb).toContain('<pre class="md-code-block">');
    expect(cb).toContain("const x = 1;");
  });

  it("renders strikethrough", () => {
    expect(renderMarkdown("~~removed~~")).toContain("<del>removed</del>");
  });

  it("renders unordered lists", () => {
    const list = renderMarkdown("- item 1\n- item 2");
    expect(list).toContain('<li class="md-li">item 1</li>');
    expect(list).toContain('<ul class="md-ul">');
  });

  it("renders blockquotes", () => {
    const q = renderMarkdown("> quote text");
    expect(q).toContain('<blockquote class="md-quote">quote text</blockquote>');
  });

  it("escapes HTML", () => {
    const h = renderMarkdown("<script>alert('xss')</script>");
    expect(h).not.toContain("<script>");
    expect(h).toContain("&lt;script&gt;");
  });
});
