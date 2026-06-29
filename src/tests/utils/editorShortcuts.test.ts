import { describe, it, expect } from 'vitest';
import { wrapSelection } from '../../utils/editorShortcuts';

const makeTextarea = (value: string, start: number, end: number): HTMLTextAreaElement => {
  const el = document.createElement('textarea');
  el.value = value;
  el.selectionStart = start;
  el.selectionEnd = end;
  return el;
};

describe('wrapSelection', () => {
  // ── Жирный текст (**) ─────────────────────────────────────────────────────

  it('wraps selected text with bold markers', () => {
    const el = makeTextarea('hello world', 0, 5);
    expect(wrapSelection(el, '**').value).toBe('**hello** world');
  });

  it('returns correct start after bold wrap', () => {
    const el = makeTextarea('hello world', 0, 5);
    expect(wrapSelection(el, '**').start).toBe(2); // start + wrapper.length
  });

  it('returns correct end after bold wrap', () => {
    const el = makeTextarea('hello world', 0, 5);
    expect(wrapSelection(el, '**').end).toBe(7); // end + wrapper.length
  });

  // ── Курсив текст (*) ──────────────────────────────────────────────────────

  it('wraps selected text with italic markers', () => {
    const el = makeTextarea('hello world', 6, 11);
    expect(wrapSelection(el, '*').value).toBe('hello *world*');
  });

  it('returns correct positions after italic wrap', () => {
    const el = makeTextarea('hello world', 6, 11);
    const result = wrapSelection(el, '*');
    expect(result.start).toBe(7);
    expect(result.end).toBe(12);
  });

  // ── Нет выделения (курсор) ────────────────────────────────────────────────

  it('inserts double markers at cursor when nothing is selected', () => {
    const el = makeTextarea('hello world', 5, 5);
    const result = wrapSelection(el, '**');
    expect(result.value).toBe('hello**** world');
  });

  it('cursor lands between markers on empty selection', () => {
    const el = makeTextarea('hello world', 5, 5);
    const result = wrapSelection(el, '**');
    expect(result.start).toBe(7);
    expect(result.end).toBe(7);
  });

  // ── Прочие случаи ─────────────────────────────────────────────────────────

  it('wraps text in middle of content', () => {
    const el = makeTextarea('say hello there', 4, 9);
    expect(wrapSelection(el, '*').value).toBe('say *hello* there');
  });

  it('preserves text outside selection', () => {
    const el = makeTextarea('abc def ghi', 4, 7);
    const result = wrapSelection(el, '**');
    expect(result.value).toBe('abc **def** ghi');
  });

  it('wraps the entire text when all is selected', () => {
    const el = makeTextarea('all', 0, 3);
    const result = wrapSelection(el, '**');
    expect(result.value).toBe('**all**');
    expect(result.start).toBe(2);
    expect(result.end).toBe(5);
  });

  it('does not modify the original textarea value', () => {
    const el = makeTextarea('hello', 0, 5);
    wrapSelection(el, '**');
    expect(el.value).toBe('hello');
  });
});
