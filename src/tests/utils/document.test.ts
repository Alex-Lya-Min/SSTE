import { describe, it, expect } from 'vitest';
import { createId, createDemoDocument, extractTitle, getUniqueTitle, isUntitledTitle } from '../../utils/document';
import type { DocumentItem } from '../../types';

const makeDoc = (id: string, title: string): DocumentItem => ({
  id,
  title,
  content: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

// ─── createId ────────────────────────────────────────────────────────────────

describe('createId', () => {
  it('returns a non-empty string', () => {
    expect(typeof createId()).toBe('string');
    expect(createId().length).toBeGreaterThan(0);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createId()));
    expect(ids.size).toBe(100);
  });
});

// ─── extractTitle ─────────────────────────────────────────────────────────────

describe('extractTitle', () => {
  it('extracts h1 heading', () => {
    expect(extractTitle('# Hello World\n\nSome text')).toBe('Hello World');
  });

  it('extracts h2 heading', () => {
    expect(extractTitle('## My Title\n\nContent')).toBe('My Title');
  });

  it('extracts deep heading', () => {
    expect(extractTitle('### Deep')).toBe('Deep');
  });

  it('falls back to first non-empty line when no heading', () => {
    expect(extractTitle('Plain line\nSecond')).toBe('Plain line');
  });

  it('truncates first line to 40 characters', () => {
    expect(extractTitle('A'.repeat(60))).toBe('A'.repeat(40));
  });

  it('returns Untitled for empty content', () => {
    expect(extractTitle('')).toBe('Untitled');
  });

  it('returns Untitled for whitespace-only content', () => {
    expect(extractTitle('   \n\n  ')).toBe('Untitled');
  });

  it('returns Untitled for heading with no text', () => {
    expect(extractTitle('# \n\nContent')).toBe('Untitled');
  });

  it('skips blank lines before first heading', () => {
    expect(extractTitle('\n\n# Title\n\nBody')).toBe('Title');
  });
});

// ─── getUniqueTitle ───────────────────────────────────────────────────────────

describe('getUniqueTitle', () => {
  it('returns base title when no conflicts', () => {
    expect(getUniqueTitle('New Doc', [makeDoc('1', 'Other')])).toBe('New Doc');
  });

  it('appends (1) on first conflict', () => {
    expect(getUniqueTitle('Untitled', [makeDoc('1', 'Untitled')])).toBe('Untitled (1)');
  });

  it('increments counter for multiple conflicts', () => {
    const docs = [
      makeDoc('1', 'Untitled'),
      makeDoc('2', 'Untitled (1)'),
      makeDoc('3', 'Untitled (2)'),
    ];
    expect(getUniqueTitle('Untitled', docs)).toBe('Untitled (3)');
  });

  it('falls back to Untitled for empty base title', () => {
    expect(getUniqueTitle('', [])).toBe('Untitled');
  });

  it('falls back to Untitled for whitespace-only base title', () => {
    expect(getUniqueTitle('   ', [])).toBe('Untitled');
  });

  it('returns base title with empty docs list', () => {
    expect(getUniqueTitle('My Doc', [])).toBe('My Doc');
  });
});

// ─── isUntitledTitle ──────────────────────────────────────────────────────────

describe('isUntitledTitle', () => {
  it('matches "Untitled"', () => {
    expect(isUntitledTitle('Untitled')).toBe(true);
  });

  it('matches "Untitled (1)"', () => {
    expect(isUntitledTitle('Untitled (1)')).toBe(true);
  });

  it('matches "Untitled (99)"', () => {
    expect(isUntitledTitle('Untitled (99)')).toBe(true);
  });

  it('does not match custom titles', () => {
    expect(isUntitledTitle('My Document')).toBe(false);
  });

  it('does not match partial matches', () => {
    expect(isUntitledTitle('Untitled Document')).toBe(false);
  });

  it('does not match "Untitled (abc)"', () => {
    expect(isUntitledTitle('Untitled (abc)')).toBe(false);
  });

  it('does not match empty string', () => {
    expect(isUntitledTitle('')).toBe(false);
  });
});

// ─── createDemoDocument ───────────────────────────────────────────────────────

describe('createDemoDocument', () => {
  it('has all required fields', () => {
    const doc = createDemoDocument();
    expect(doc).toHaveProperty('id');
    expect(doc).toHaveProperty('title');
    expect(doc).toHaveProperty('content');
    expect(doc).toHaveProperty('createdAt');
    expect(doc).toHaveProperty('updatedAt');
  });

  it('title is Welcome', () => {
    expect(createDemoDocument().title).toBe('Welcome');
  });

  it('content is non-empty', () => {
    expect(createDemoDocument().content.length).toBeGreaterThan(0);
  });

  it('generates unique id each call', () => {
    const a = createDemoDocument();
    const b = createDemoDocument();
    expect(a.id).not.toBe(b.id);
  });
});
