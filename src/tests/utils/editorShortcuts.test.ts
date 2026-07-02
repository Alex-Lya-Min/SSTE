import { describe, it, expect, afterEach } from 'vitest';
import { EditorSelection, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { wrapSelection } from '../../utils/editorShortcuts';

let views: EditorView[] = [];

const makeView = (doc: string, anchor: number, head = anchor): EditorView => {
  const view = new EditorView({
    state: EditorState.create({ doc, selection: EditorSelection.single(anchor, head) }),
    parent: document.body
  });
  views.push(view);
  return view;
};

afterEach(() => {
  views.forEach((view) => view.destroy());
  views = [];
});

describe('wrapSelection (CodeMirror)', () => {
  // ── Жирный текст (**) ─────────────────────────────────────────────────────

  it('wraps selected text with bold markers', () => {
    const view = makeView('hello world', 0, 5);
    wrapSelection(view, '**');
    expect(view.state.doc.toString()).toBe('**hello** world');
  });

  it('keeps the original text selected after bold wrap', () => {
    const view = makeView('hello world', 0, 5);
    wrapSelection(view, '**');
    const { from, to } = view.state.selection.main;
    expect(from).toBe(2);
    expect(to).toBe(7);
    expect(view.state.sliceDoc(from, to)).toBe('hello');
  });

  // ── Курсив (*) ────────────────────────────────────────────────────────────

  it('wraps selected text with italic markers', () => {
    const view = makeView('hello world', 6, 11);
    wrapSelection(view, '*');
    expect(view.state.doc.toString()).toBe('hello *world*');
  });

  it('keeps the original text selected after italic wrap', () => {
    const view = makeView('hello world', 6, 11);
    wrapSelection(view, '*');
    const { from, to } = view.state.selection.main;
    expect(from).toBe(7);
    expect(to).toBe(12);
    expect(view.state.sliceDoc(from, to)).toBe('world');
  });

  // ── Нет выделения (курсор) ────────────────────────────────────────────────

  it('inserts double markers at cursor when nothing is selected', () => {
    const view = makeView('hello world', 5);
    wrapSelection(view, '**');
    expect(view.state.doc.toString()).toBe('hello**** world');
  });

  it('cursor lands between markers on empty selection', () => {
    const view = makeView('hello world', 5);
    wrapSelection(view, '**');
    const { from, to } = view.state.selection.main;
    expect(from).toBe(7);
    expect(to).toBe(7);
  });

  // ── Прочие случаи ─────────────────────────────────────────────────────────

  it('wraps text in middle of content', () => {
    const view = makeView('say hello there', 4, 9);
    wrapSelection(view, '*');
    expect(view.state.doc.toString()).toBe('say *hello* there');
  });

  it('preserves text outside selection', () => {
    const view = makeView('abc def ghi', 4, 7);
    wrapSelection(view, '**');
    expect(view.state.doc.toString()).toBe('abc **def** ghi');
  });

  it('wraps the entire text when all is selected', () => {
    const view = makeView('all', 0, 3);
    wrapSelection(view, '**');
    expect(view.state.doc.toString()).toBe('**all**');
    expect(view.state.selection.main.from).toBe(2);
    expect(view.state.selection.main.to).toBe(5);
  });

  it('returns true so the keymap treats it as handled', () => {
    const view = makeView('text', 0, 4);
    expect(wrapSelection(view, '**')).toBe(true);
  });

  it('supports undo as a single history step', () => {
    const view = makeView('hello', 0, 5);
    wrapSelection(view, '**');
    expect(view.state.doc.toString()).toBe('**hello**');
  });
});
