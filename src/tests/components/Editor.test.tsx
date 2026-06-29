import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Editor } from '../../components/Editor';

describe('Editor', () => {
  // ── Рендеринг ─────────────────────────────────────────────────────────────

  it('renders a textarea', () => {
    render(<Editor value="" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<Editor value="Hello markdown" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('Hello markdown');
  });

  it('shows placeholder text', () => {
    render(<Editor value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Write your markdown here...')).toBeInTheDocument();
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

  // ── События ───────────────────────────────────────────────────────────────

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<Editor value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New text' } });
    expect(onChange).toHaveBeenCalledWith('New text');
  });

  it('calls onChange on every change event', () => {
    const onChange = vi.fn();
    render(<Editor value="a" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } });
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  // ── onMount callback ──────────────────────────────────────────────────────

  it('calls onMount with the textarea element on mount', () => {
    const onMount = vi.fn();
    render(<Editor value="" onChange={vi.fn()} onMount={onMount} />);
    expect(onMount).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
  });

  it('does not call onMount if not provided', () => {
    expect(() => render(<Editor value="" onChange={vi.fn()} />)).not.toThrow();
  });
});
