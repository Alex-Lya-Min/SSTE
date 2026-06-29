import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../../components/Sidebar';
import type { DocumentItem } from '../../types';

const makeDoc = (id: string, title: string): DocumentItem => ({
  id,
  title,
  content: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
});

const defaults = {
  activeDocumentId: null as string | null,
  onSelect: vi.fn(),
  onCreate: vi.fn(),
  onRename: vi.fn(),
  onDelete: vi.fn(),
};

describe('Sidebar', () => {
  // ── Видимость ─────────────────────────────────────────────────────────────

  it('renders nothing when hidden', () => {
    const { container } = render(<Sidebar documents={[]} {...defaults} hidden />);
    expect(container.firstChild).toBeNull();
  });

  it('renders when not hidden', () => {
    render(<Sidebar documents={[]} {...defaults} />);
    expect(screen.getByText('Documents')).toBeInTheDocument();
  });

  // ── Пустое состояние ──────────────────────────────────────────────────────

  it('shows empty state message when no documents', () => {
    render(<Sidebar documents={[]} {...defaults} />);
    expect(screen.getByText('No documents yet')).toBeInTheDocument();
  });

  it('does not show empty state when documents exist', () => {
    render(<Sidebar documents={[makeDoc('1', 'Doc')]} {...defaults} />);
    expect(screen.queryByText('No documents yet')).toBeNull();
  });

  // ── Список документов ─────────────────────────────────────────────────────

  it('renders document titles', () => {
    const docs = [makeDoc('1', 'First Doc'), makeDoc('2', 'Second Doc')];
    render(<Sidebar documents={docs} {...defaults} />);
    expect(screen.getByText('First Doc')).toBeInTheDocument();
    expect(screen.getByText('Second Doc')).toBeInTheDocument();
  });

  it('highlights the active document', () => {
    const docs = [makeDoc('1', 'Active'), makeDoc('2', 'Other')];
    render(<Sidebar documents={docs} {...defaults} activeDocumentId="1" />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveClass('active');
    expect(items[1]).not.toHaveClass('active');
  });

  it('shows updated date for each document', () => {
    render(<Sidebar documents={[makeDoc('1', 'Doc')]} {...defaults} />);
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
  });

  // ── Действия ──────────────────────────────────────────────────────────────

  it('calls onSelect when document title clicked', () => {
    const onSelect = vi.fn();
    render(<Sidebar documents={[makeDoc('1', 'Doc One')]} {...defaults} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Doc One'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('calls onCreate when New button clicked', () => {
    const onCreate = vi.fn();
    render(<Sidebar documents={[]} {...defaults} onCreate={onCreate} />);
    fireEvent.click(screen.getByText('New'));
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it('calls onRename with correct id when Rename clicked', () => {
    const onRename = vi.fn();
    render(<Sidebar documents={[makeDoc('1', 'Doc One')]} {...defaults} onRename={onRename} />);
    fireEvent.click(screen.getByText('Rename'));
    expect(onRename).toHaveBeenCalledWith('1');
  });

  it('calls onDelete with correct id when Delete clicked', () => {
    const onDelete = vi.fn();
    render(<Sidebar documents={[makeDoc('1', 'Doc One')]} {...defaults} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('calls correct onRename when multiple docs exist', () => {
    const onRename = vi.fn();
    const docs = [makeDoc('1', 'First'), makeDoc('2', 'Second')];
    render(<Sidebar documents={docs} {...defaults} onRename={onRename} />);
    const renameButtons = screen.getAllByText('Rename');
    fireEvent.click(renameButtons[1]);
    expect(onRename).toHaveBeenCalledWith('2');
  });
});
