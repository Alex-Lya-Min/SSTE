import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { EditorView } from '@codemirror/view';
import { EditorSelection } from '@codemirror/state';
import { Editor } from '../../components/Editor';

const getView = (): EditorView => {
  const content = document.querySelector('.cm-content') as HTMLElement | null;
  if (!content) throw new Error('CodeMirror content not found');
  const view = EditorView.findFromDOM(content);
  if (!view) throw new Error('CodeMirror view not found');
  return view;
};

const typeText = (text: string) => {
  const view = getView();
  act(() => {
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });
  });
};

describe('Editor (CodeMirror)', () => {
  // ── Рендеринг ─────────────────────────────────────────────────────────────

  it('renders a CodeMirror editor with textbox role', () => {
    render(<Editor value="" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(document.querySelector('.cm-editor')).not.toBeNull();
  });

  it('displays the current value', () => {
    render(<Editor value="Hello markdown" onChange={vi.fn()} />);
    expect(getView().state.doc.toString()).toBe('Hello markdown');
  });

  it('shows placeholder when empty', () => {
    render(<Editor value="" onChange={vi.fn()} />);
    expect(document.querySelector('.cm-placeholder')?.textContent).toBe(
      'Write your markdown here...'
    );
  });

  it('does not show placeholder when value has content', () => {
    render(<Editor value="Some text" onChange={vi.fn()} />);
    expect(document.querySelector('.cm-placeholder')).toBeNull();
  });

  // ── CSS-классы ────────────────────────────────────────────────────────────

  it('applies is-empty class when value is empty', () => {
    const { container } = render(<Editor value="" onChange={vi.fn()} />);
    expect(container.firstChild).toHaveClass('is-empty');
  });

  it('applies is-empty class when value is only whitespace', () => {
    const { container } = render(<Editor value="   " onChange={vi.fn()} />);
    expect(container.firstChild).toHaveClass('is-empty');
  });

  it('does not apply is-empty class when value has content', () => {
    const { container } = render(<Editor value="Some text" onChange={vi.fn()} />);
    expect(container.firstChild).not.toHaveClass('is-empty');
  });

  it('applies is-calm class when calmMode is true', () => {
    const { container } = render(<Editor value="" onChange={vi.fn()} calmMode />);
    expect(container.firstChild).toHaveClass('is-calm');
  });

  it('does not apply is-calm class by default', () => {
    const { container } = render(<Editor value="" onChange={vi.fn()} />);
    expect(container.firstChild).not.toHaveClass('is-calm');
  });

  it('always applies typewriter-mode class', () => {
    const { container } = render(<Editor value="" onChange={vi.fn()} />);
    expect(container.firstChild).toHaveClass('typewriter-mode');
  });

  // ── onChange ──────────────────────────────────────────────────────────────

  it('calls onChange when the document is edited', () => {
    const onChange = vi.fn();
    render(<Editor value="" onChange={onChange} />);
    typeText('New text');
    expect(onChange).toHaveBeenCalledWith('New text');
  });

  it('calls onChange on every edit', () => {
    const onChange = vi.fn();
    render(<Editor value="" onChange={onChange} />);
    typeText('a');
    typeText('ab');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  // ── Синхронизация value (переключение документов) ─────────────────────────

  it('updates the document when value prop changes', () => {
    const { rerender } = render(<Editor value="first doc" onChange={vi.fn()} />);
    rerender(<Editor value="second doc" onChange={vi.fn()} />);
    expect(getView().state.doc.toString()).toBe('second doc');
  });

  it('does not call onChange when value prop syncs externally', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Editor value="first doc" onChange={onChange} />);
    rerender(<Editor value="second doc" onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the same view instance across value updates', () => {
    const { rerender } = render(<Editor value="one" onChange={vi.fn()} />);
    const before = getView();
    rerender(<Editor value="two" onChange={vi.fn()} />);
    expect(getView()).toBe(before);
  });

  // ── Горячие клавиши Ctrl+B / Ctrl+I ───────────────────────────────────────

  it('wraps selection in ** on Ctrl+B', () => {
    const onChange = vi.fn();
    render(<Editor value="hello world" onChange={onChange} />);
    const view = getView();
    act(() => {
      view.dispatch({ selection: EditorSelection.single(0, 5) });
    });
    fireEvent.keyDown(view.contentDOM, { key: 'b', ctrlKey: true });
    expect(view.state.doc.toString()).toBe('**hello** world');
    expect(onChange).toHaveBeenCalledWith('**hello** world');
  });

  it('wraps selection in * on Ctrl+I', () => {
    const onChange = vi.fn();
    render(<Editor value="hello world" onChange={onChange} />);
    const view = getView();
    act(() => {
      view.dispatch({ selection: EditorSelection.single(6, 11) });
    });
    fireEvent.keyDown(view.contentDOM, { key: 'i', ctrlKey: true });
    expect(view.state.doc.toString()).toBe('hello *world*');
  });

  // ── Номера строк ──────────────────────────────────────────────────────────

  it('does not show line numbers by default', () => {
    render(<Editor value="line one" onChange={vi.fn()} />);
    expect(document.querySelector('.cm-lineNumbers')).toBeNull();
  });

  it('shows line numbers when showLineNumbers is true', () => {
    render(<Editor value={'one\ntwo\nthree'} onChange={vi.fn()} showLineNumbers />);
    expect(document.querySelector('.cm-lineNumbers')).not.toBeNull();
  });

  it('renders a gutter element for each line', () => {
    render(<Editor value={'one\ntwo\nthree'} onChange={vi.fn()} showLineNumbers />);
    const gutter = document.querySelector('.cm-lineNumbers');
    expect(gutter?.textContent).toContain('1');
    expect(gutter?.textContent).toContain('2');
    expect(gutter?.textContent).toContain('3');
  });

  it('toggles line numbers on a live editor without remount', () => {
    const { rerender } = render(<Editor value="text" onChange={vi.fn()} />);
    const before = getView();
    expect(document.querySelector('.cm-lineNumbers')).toBeNull();

    rerender(<Editor value="text" onChange={vi.fn()} showLineNumbers />);
    expect(document.querySelector('.cm-lineNumbers')).not.toBeNull();
    expect(getView()).toBe(before);

    rerender(<Editor value="text" onChange={vi.fn()} showLineNumbers={false} />);
    expect(document.querySelector('.cm-lineNumbers')).toBeNull();
  });

  // ── Inline-подсветка markdown ─────────────────────────────────────────────

  it('applies syntax highlighting spans to markdown content', async () => {
    render(<Editor value={'# Heading\n\n**bold** and *italic*'} onChange={vi.fn()} />);
    await waitFor(() => {
      const highlighted = document.querySelectorAll('.cm-content span[class]');
      expect(highlighted.length).toBeGreaterThan(0);
    });
  });

  it('renders markdown text content in the editor', () => {
    render(<Editor value="# My Heading" onChange={vi.fn()} />);
    expect(document.querySelector('.cm-content')?.textContent).toContain('# My Heading');
  });
});
