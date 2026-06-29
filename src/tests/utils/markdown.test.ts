import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../../utils/markdown';

describe('renderMarkdown', () => {
  // ── Базовый рендеринг ─────────────────────────────────────────────────────

  it('renders empty string without crashing', () => {
    expect(() => renderMarkdown('')).not.toThrow();
  });

  it('returns a string', () => {
    expect(typeof renderMarkdown('hello')).toBe('string');
  });

  it('renders a paragraph', () => {
    expect(renderMarkdown('Hello world')).toContain('Hello world');
  });

  it('renders h1 heading', () => {
    expect(renderMarkdown('# Title')).toContain('<h1>Title</h1>');
  });

  it('renders h2 heading', () => {
    expect(renderMarkdown('## Subtitle')).toContain('<h2>Subtitle</h2>');
  });

  it('renders bold text', () => {
    expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>');
  });

  it('renders italic text', () => {
    expect(renderMarkdown('*italic*')).toContain('<em>italic</em>');
  });

  it('renders unordered list items', () => {
    const result = renderMarkdown('- item one\n- item two');
    expect(result).toContain('<li>item one</li>');
    expect(result).toContain('<li>item two</li>');
  });

  it('renders a hyperlink', () => {
    const result = renderMarkdown('[Google](https://google.com)');
    expect(result).toContain('href="https://google.com"');
    expect(result).toContain('Google');
  });

  // ── Опция breaks: true ────────────────────────────────────────────────────

  it('inserts <br> on single newline (breaks option)', () => {
    const result = renderMarkdown('line one\nline two');
    expect(result).toContain('<br>');
  });

  // ── XSS-защита через DOMPurify ────────────────────────────────────────────

  it('removes <script> tags', () => {
    const result = renderMarkdown('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
  });

  it('removes javascript: in href', () => {
    const result = renderMarkdown('[click](javascript:alert(1))');
    expect(result).not.toContain('javascript:');
  });

  it('removes onerror attribute', () => {
    const result = renderMarkdown('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain('onerror');
  });

  it('removes onclick attribute', () => {
    const result = renderMarkdown('<a onclick="evil()">link</a>');
    expect(result).not.toContain('onclick');
  });

  it('keeps safe HTML like <strong>', () => {
    const result = renderMarkdown('**bold text**');
    expect(result).toContain('<strong>');
  });
});
