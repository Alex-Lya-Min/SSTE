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
  lineNumbers: false,
  onChangeTheme: vi.fn(),
  onChangeThemeFamily: vi.fn(),
  onChangeUiScale: vi.fn(),
  onChangeHighlightTheme: vi.fn(),
  onChangeLineNumbers: vi.fn(),
};

const getGroup = (label: string) => within(screen.getByRole('group', { name: label }));

describe('Settings (sidebar panel)', () => {
  // ── Видимость ─────────────────────────────────────────────────────────────

  it('renders nothing when closed', () => {
    const { container } = render(<Settings {...defaults} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders as a sidebar panel (not a modal) when open', () => {
    render(<Settings {...defaults} />);
    expect(screen.getByRole('complementary', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.querySelector('.settings-overlay')).toBeNull();
  });

  it('uses sidebar styling classes', () => {
    render(<Settings {...defaults} />);
    const panel = screen.getByRole('complementary', { name: 'Settings' });
    expect(panel).toHaveClass('sidebar');
    expect(panel).toHaveClass('settings-sidebar');
  });

  // ── Секции ────────────────────────────────────────────────────────────────

  it('renders all five option groups', () => {
    render(<Settings {...defaults} />);
    expect(screen.getByRole('group', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Editor highlighting' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Interface size' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Line numbers' })).toBeInTheDocument();
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

  it('renders line numbers options Off / On', () => {
    render(<Settings {...defaults} />);
    const group = getGroup('Line numbers');
    expect(group.getByText('Off')).toBeInTheDocument();
    expect(group.getByText('On')).toBeInTheDocument();
  });

  // ── Активное состояние ────────────────────────────────────────────────────

  it('marks the current values as active', () => {
    render(
      <Settings
        {...defaults}
        theme="dark"
        uiScale="l"
        highlightTheme="monokai"
        themeFamily="nintendo"
        lineNumbers
      />
    );
    expect(getGroup('Appearance').getByText('Dark')).toHaveClass('active');
    expect(getGroup('Theme').getByRole('button', { name: /Nintendo/ })).toHaveClass('active');
    expect(getGroup('Editor highlighting').getByText('Monokai')).toHaveClass('active');
    expect(getGroup('Interface size').getByText('L')).toHaveClass('active');
    expect(getGroup('Line numbers').getByText('On')).toHaveClass('active');
  });

  it('marks Off as active when line numbers disabled', () => {
    render(<Settings {...defaults} lineNumbers={false} />);
    expect(getGroup('Line numbers').getByText('Off')).toHaveClass('active');
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

  it('calls onChangeLineNumbers(true) when On clicked', () => {
    const onChangeLineNumbers = vi.fn();
    render(<Settings {...defaults} onChangeLineNumbers={onChangeLineNumbers} />);
    fireEvent.click(getGroup('Line numbers').getByText('On'));
    expect(onChangeLineNumbers).toHaveBeenCalledWith(true);
  });

  it('calls onChangeLineNumbers(false) when Off clicked', () => {
    const onChangeLineNumbers = vi.fn();
    render(<Settings {...defaults} lineNumbers onChangeLineNumbers={onChangeLineNumbers} />);
    fireEvent.click(getGroup('Line numbers').getByText('Off'));
    expect(onChangeLineNumbers).toHaveBeenCalledWith(false);
  });

  // ── Закрытие ──────────────────────────────────────────────────────────────

  it('calls onClose when Done button clicked', () => {
    const onClose = vi.fn();
    render(<Settings {...defaults} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close settings'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(<Settings {...defaults} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
