import { describe, it, expect } from 'vitest';
import { getTextStats } from '../../utils/textStats';

describe('getTextStats', () => {
  // ── Пустой контент ────────────────────────────────────────────────────────

  it('returns zero words for empty string', () => {
    expect(getTextStats('').words).toBe(0);
  });

  it('returns zero characters for empty string', () => {
    expect(getTextStats('').characters).toBe(0);
  });

  it('returns 0 reading minutes for empty content (bug #3 regression)', () => {
    expect(getTextStats('').readingMinutes).toBe(0);
  });

  it('returns 0 reading minutes for whitespace-only content', () => {
    expect(getTextStats('   \n\n  ').readingMinutes).toBe(0);
  });

  // ── Подсчёт слов ──────────────────────────────────────────────────────────

  it('counts a single word', () => {
    expect(getTextStats('hello').words).toBe(1);
  });

  it('counts two words', () => {
    expect(getTextStats('hello world').words).toBe(2);
  });

  it('handles multiple spaces between words', () => {
    expect(getTextStats('hello   world').words).toBe(2);
  });

  it('handles leading/trailing whitespace', () => {
    expect(getTextStats('  hello world  ').words).toBe(2);
  });

  it('counts words across multiple lines', () => {
    expect(getTextStats('line one\nline two\nline three').words).toBe(6);
  });

  // ── Подсчёт символов ──────────────────────────────────────────────────────

  it('counts characters including spaces', () => {
    expect(getTextStats('hello world').characters).toBe(11);
  });

  it('counts characters including newlines', () => {
    expect(getTextStats('a\nb').characters).toBe(3);
  });

  // ── Время чтения ──────────────────────────────────────────────────────────

  it('returns 1 minute for a few words', () => {
    expect(getTextStats('hello world').readingMinutes).toBe(1);
  });

  it('calculates reading time at 200 wpm', () => {
    const text = 'word '.repeat(400).trim();
    expect(getTextStats(text).readingMinutes).toBe(2);
  });

  it('rounds up reading time', () => {
    const text = 'word '.repeat(201).trim();
    expect(getTextStats(text).readingMinutes).toBe(2);
  });

  it('returns 1 minute for exactly 200 words', () => {
    const text = 'word '.repeat(200).trim();
    expect(getTextStats(text).readingMinutes).toBe(1);
  });
});
