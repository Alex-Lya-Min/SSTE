import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true
});

export const renderMarkdown = (markdown: string): string => {
  const raw = marked.parse(markdown) as string;
  return DOMPurify.sanitize(raw);
};
