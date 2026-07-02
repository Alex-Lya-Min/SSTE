import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Settings } from '../../components/Settings';

const defaults = {
  open: true,
  onClose: vi.fn(),
  theme: 'light' as const,
  themeFamily: 'classic' as const,
  uiScale: 'm' as const,
  highlightTheme: 'default' as const,
  onChangeTheme: vi.fn(),
  onChangeThemeFamily: vi.fn(),
  onChangeUiScale: vi.fn(),
  onChangeHighlightTheme: vi.fn(),
};

const getGroup = (label: string) => within(screen.getByRole('group', { name: label }));

describe('Settings', () => {
  // ── Видимость ─────────────────────────────────────────────────────────────

  it('renders nothing when closed', () => {
    const { container } = render(<Settings {...defaults} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a dialog when open', () => {
    render(<Settings {...defaults} />);
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  });

  // ── Секции ────────────────────────────────────────────────────────────────

  it('renders all four option groups', () => {
    render(<Settings {...defaults} />);
    expect(screen.getByRole('group', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Editor highlighting' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Interface size' })).toBeInTheDocument();
  });

  it('renders appearance options', () => {
    render(<Settings {...defaults} />);
    const group = getGroup('Appearance');
    expect(group.getByText('Light')).toBeInTheDocument();
    expect(group.getByText('Dark')).toBeInTheDocument();
  });

  it('renders theme family options', () => {
    render(<Settings {...defaults} />);
    const group = getGroup('Theme');
    expect(group.getByText('Classic')).toBeInTheDocument();
    expect(group.getByText("'80s")).toBeInTheDocument();
    expect(group.getByText('Nintendo')).toBeInTheDocument();
  });

  it('renders highlight options', () => {
    render(<Settings {...defaults} />);
    const group = getGroup('Editor highlighting');
    expect(group.getByText('Default')).toBeInTheDocument();
    expect(group.getByText('VS Code')).toBeInTheDocument();
    expect(group.getByText('Monokai')).toBeInTheDocument();
    expect(group.getByText('Solarized')).toBeInTheDocument();
  });

  it('renders interface size options S / M / L', () => {
    render(<Settings {...defaults} />);
    const group = getGroup('Interface size');
    expect(group.getByText('S')).toBeInTheDocument();
    expect(group.getByText('M')).toBeInTheDocument();
    expect(group.getByText('L')).toBeInTheDocument();
  });

  // ── Активное состояние ────────────────────────────────────────────────────

  it('marks the current values as active', () => {
    render(<Settings {...defaults} theme="dark" uiScale="l" highlightTheme="monokai" themeFamily="nintendo" />);
    expect(getGroup('Appearance').getByText('Dark')).toHaveClass('active');
    expect(getGroup('Theme').getByRole('button', { name: /Nintendo/ })).toHaveClass('active');
    expect(getGroup('Editor highlighting').getByText('Monokai')).toHaveClass('active');
    expect(getGroup('Interface size').getByText('L')).toHaveClass('active');
  });

  it('sets aria-pressed on the active option', () => {
    render(<Settings {...defaults} />);
    expect(getGroup('Interface size').getByText('M')).toHaveAttribute('aria-pressed', 'true');
    expect(getGroup('Interface size').getByText('S')).toHaveAttribute('aria-pressed', 'false');
  });

  // ── Обработчики ───────────────────────────────────────────────────────────

  it('calls onChangeTheme when appearance option clicked', () => {
    const onChangeTheme = vi.fn();
    render(<Settings {...defaults} onChangeTheme={onChangeTheme} />);
    fireEvent.click(getGroup('Appearance').getByText('Dark'));
    expect(onChangeTheme).toHaveBeenCalledWith('dark');
  });

  it('calls onChangeThemeFamily when theme option clicked', () => {
    const onChangeThemeFamily = vi.fn();
    render(<Settings {...defaults} onChangeThemeFamily={onChangeThemeFamily} />);
    fireEvent.click(getGroup('Theme').getByRole('button', { name: /'80s/ }));
    expect(onChangeThemeFamily).toHaveBeenCalledWith('eighties');
  });

  it('calls onChangeHighlightTheme when highlight option clicked', () => {
    const onChangeHighlightTheme = vi.fn();
    render(<Settings {...defaults} onChangeHighlightTheme={onChangeHighlightTheme} />);
    fireEvent.click(getGroup('Editor highlighting').getByText('VS Code'));
    expect(onChangeHighlightTheme).toHaveBeenCalledWith('vscode');
  });

  it('calls onChangeUiScale when size option clicked', () => {
    const onChangeUiScale = vi.fn();
    render(<Settings {...defaults} onChangeUiScale={onChangeUiScale} />);
    fireEvent.click(getGroup('Interface size').getByText('S'));
    expect(onChangeUiScale).toHaveBeenCalledWith('s');
  });

  // ── Закрытие ──────────────────────────────────────────────────────────────

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<Settings {...defaults} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close settings'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<Settings {...defaults} onClose={onClose} />);
    fireEvent.click(container.querySelector('.settings-overlay')!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when clicking inside the panel', () => {
    const onClose = vi.fn();
    render(<Settings {...defaults} onClose={onClose} />);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(<Settings {...defaults} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
