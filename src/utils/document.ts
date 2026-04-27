import type { DocumentItem } from '../types';

export const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const extractTitle = (content: string): string => {
  const lines = content.split(/\r?\n/);
  const heading = lines.find((line) => line.trim().startsWith('#'));
  if (heading) {
    return heading.replace(/^#+\s*/, '').trim() || 'Untitled';
  }
  const firstText = lines.find((line) => line.trim().length > 0);
  return firstText?.slice(0, 40) || 'Untitled';
};

export const createDemoDocument = (): DocumentItem => {
  const now = new Date().toISOString();
  const content = `# Welcome\n\nThis is your first document.\n\n- Write in **Markdown**\n- Toggle Preview or Split mode\n- Press Ctrl/Cmd + S to save now\n\nHappy writing.`;

  return {
    id: createId(),
    title: 'Welcome',
    content,
    createdAt: now,
    updatedAt: now
  };
};

export const getUniqueTitle = (baseTitle: string, docs: DocumentItem[]): string => {
  const safeTitle = baseTitle.trim() || 'Untitled';
  if (!docs.some((doc) => doc.title === safeTitle)) return safeTitle;

  let counter = 1;
  while (docs.some((doc) => doc.title === `${safeTitle} (${counter})`)) {
    counter += 1;
  }
  return `${safeTitle} (${counter})`;
};
