import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBar } from '../../components/StatusBar';

const zero = { words: 0, characters: 0, readingMinutes: 0 };

describe('StatusBar', () => {
  // ── Статус сохранения ─────────────────────────────────────────────────────

  it('shows "Saved" status', () => {
    render(<StatusBar saveStatus="saved" stats={zero} />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('shows "Saving…" status', () => {
    render(<StatusBar saveStatus="saving" stats={zero} />);
    expect(screen.getByText('Saving…')).toBeInTheDocument();
  });

  it('shows "Unsaved changes" status', () => {
    render(<StatusBar saveStatus="unsaved" stats={zero} />);
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });

  // ── Статистика ────────────────────────────────────────────────────────────

  it('shows word count', () => {
    render(<StatusBar saveStatus="saved" stats={{ words: 42, characters: 200, readingMinutes: 1 }} />);
    expect(screen.getByText('Words: 42')).toBeInTheDocument();
  });

  it('shows character count', () => {
    render(<StatusBar saveStatus="saved" stats={{ words: 10, characters: 55, readingMinutes: 1 }} />);
    expect(screen.getByText('Characters: 55')).toBeInTheDocument();
  });

  it('shows reading time', () => {
    render(<StatusBar saveStatus="saved" stats={{ words: 400, characters: 2000, readingMinutes: 2 }} />);
    expect(screen.getByText('Reading: ~2 min')).toBeInTheDocument();
  });

  it('shows 0 reading minutes for empty document (bug #3 regression)', () => {
    render(<StatusBar saveStatus="saved" stats={{ words: 0, characters: 0, readingMinutes: 0 }} />);
    expect(screen.getByText('Reading: ~0 min')).toBeInTheDocument();
  });

  // ── Дата обновления ───────────────────────────────────────────────────────

  it('shows updatedAt when provided', () => {
    render(<StatusBar saveStatus="saved" stats={zero} updatedAt="2024-06-01T12:00:00.000Z" />);
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it('does not show updatedAt when not provided', () => {
    render(<StatusBar saveStatus="saved" stats={zero} />);
    expect(screen.queryByText(/Updated:/)).toBeNull();
  });
});
