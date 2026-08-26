export function renderMarkdown(text: string): string {
  let html = escapeHtml(text);

  // Code blocks (```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="md-code-block"><code>$2</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="md-code">$1</code>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h4 class="md-h">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="md-h">$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2 class="md-h">$1</h2>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Unordered lists
  html = html.replace(/^[*-] (.+)$/gm, '<li class="md-li">$1</li>');
  html = html.replace(/(<li class="md-li">.*<\/li>\n?)+/g, '<ul class="md-ul">$&</ul>');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="md-quote">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="md-hr" />');

  // Line breaks (double newline = paragraph break)
  html = html.replace(/\n\n/g, '</p><p class="md-p">');
  html = '<p class="md-p">' + html + '</p>';

  // Clean up empty paragraphs around block elements
  html = html.replace(/<p class="md-p"><\/p>/g, '');
  html = html.replace(/<p class="md-p">(<(?:h[2-4]|pre|ul|blockquote|hr))/g, '$1');
  html = html.replace(/(<\/(?:h[2-4]|pre|ul|blockquote)>)<\/p>/g, '$1');

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
