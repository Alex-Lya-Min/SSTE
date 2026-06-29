import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.use({ breaks: true });

export const renderMarkdown = (markdown: string): string => {
  const raw = marked.parse(markdown);
  if (raw instanceof Promise) return '';
  return DOMPurify.sanitize(raw);
};
