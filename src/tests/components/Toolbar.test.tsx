import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from '../../components/Toolbar';

const defaults = {
  viewMode: 'write' as const,
  focusMode: false,
  theme: 'light' as const,
  onChangeViewMode: vi.fn(),
  onToggleFocus: vi.fn(),
  onToggleTheme: vi.fn(),
  onImport: vi.fn(),
  onExport: vi.fn(),
  onOpenSettings: vi.fn(),
  canExport: true,
};

describe('Toolbar', () => {
  // ── Видимость ─────────────────────────────────────────────────────────────

  it('renders nothing when hidden', () => {
    const { container } = render(<Toolbar {...defaults} hidden />);
    expect(container.firstChild).toBeNull();
  });

  it('renders when not hidden', () => {
    render(<Toolbar {...defaults} />);
    expect(screen.getByText('Write')).toBeInTheDocument();
  });

  // ── Кнопки режима просмотра ───────────────────────────────────────────────

  it('renders all three view mode buttons', () => {
    render(<Toolbar {...defaults} />);
    expect(screen.getByText('Write')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Split')).toBeInTheDocument();
  });

  it('marks active write button', () => {
    render(<Toolbar {...defaults} viewMode="write" />);
    expect(screen.getByText('Write')).toHaveClass('active');
  });

  it('marks active preview button', () => {
    render(<Toolbar {...defaults} viewMode="preview" />);
    expect(screen.getByText('Preview')).toHaveClass('active');
    expect(screen.getByText('Write')).not.toHaveClass('active');
  });

  it('marks active split button', () => {
    render(<Toolbar {...defaults} viewMode="split" />);
    expect(screen.getByText('Split')).toHaveClass('active');
  });

  it('calls onChangeViewMode("write") on Write click', () => {
    const onChangeViewMode = vi.fn();
    render(<Toolbar {...defaults} onChangeViewMode={onChangeViewMode} viewMode="preview" />);
    fireEvent.click(screen.getByText('Write'));
    expect(onChangeViewMode).toHaveBeenCalledWith('write');
  });

  it('calls onChangeViewMode("preview") on Preview click', () => {
    const onChangeViewMode = vi.fn();
    render(<Toolbar {...defaults} onChangeViewMode={onChangeViewMode} />);
    fireEvent.click(screen.getByText('Preview'));
    expect(onChangeViewMode).toHaveBeenCalledWith('preview');
  });

  it('calls onChangeViewMode("split") on Split click', () => {
    const onChangeViewMode = vi.fn();
    render(<Toolbar {...defaults} onChangeViewMode={onChangeViewMode} />);
    fireEvent.click(screen.getByText('Split'));
    expect(onChangeViewMode).toHaveBeenCalledWith('split');
  });

  // ── Тема ──────────────────────────────────────────────────────────────────

  it('shows "Dark" button when theme is light', () => {
    render(<Toolbar {...defaults} theme="light" />);
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('shows "Light" button when theme is dark', () => {
    render(<Toolbar {...defaults} theme="dark" />);
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  it('calls onToggleTheme when theme button clicked', () => {
    const onToggleTheme = vi.fn();
    render(<Toolbar {...defaults} onToggleTheme={onToggleTheme} />);
    fireEvent.click(screen.getByText('Dark'));
    expect(onToggleTheme).toHaveBeenCalledOnce();
  });

  // ── Calm mode ─────────────────────────────────────────────────────────────

  it('shows Calm mode button', () => {
    render(<Toolbar {...defaults} />);
    expect(screen.getByText('Calm mode')).toBeInTheDocument();
  });

  it('calls onToggleFocus when Calm mode clicked', () => {
    const onToggleFocus = vi.fn();
    render(<Toolbar {...defaults} onToggleFocus={onToggleFocus} />);
    fireEvent.click(screen.getByText('Calm mode'));
    expect(onToggleFocus).toHaveBeenCalledOnce();
  });

  // ── Экспорт ───────────────────────────────────────────────────────────────

  it('enables export buttons when canExport is true', () => {
    render(<Toolbar {...defaults} canExport={true} />);
    expect(screen.getByText('Export .md')).not.toBeDisabled();
    expect(screen.getByText('Export .txt')).not.toBeDisabled();
  });

  it('disables export buttons when canExport is false', () => {
    render(<Toolbar {...defaults} canExport={false} />);
    expect(screen.getByText('Export .md')).toBeDisabled();
    expect(screen.getByText('Export .txt')).toBeDisabled();
  });

  it('calls onExport("md") when Export .md clicked', () => {
    const onExport = vi.fn();
    render(<Toolbar {...defaults} onExport={onExport} />);
    fireEvent.click(screen.getByText('Export .md'));
    expect(onExport).toHaveBeenCalledWith('md');
  });

  it('calls onExport("txt") when Export .txt clicked', () => {
    const onExport = vi.fn();
    render(<Toolbar {...defaults} onExport={onExport} />);
    fireEvent.click(screen.getByText('Export .txt'));
    expect(onExport).toHaveBeenCalledWith('txt');
  });

  // ── Настройки ─────────────────────────────────────────────────────────────

  it('shows Settings button', () => {
    render(<Toolbar {...defaults} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls onOpenSettings when Settings clicked', () => {
    const onOpenSettings = vi.fn();
    render(<Toolbar {...defaults} onOpenSettings={onOpenSettings} />);
    fireEvent.click(screen.getByText('Settings'));
    expect(onOpenSettings).toHaveBeenCalledOnce();
  });

  // ── Импорт ────────────────────────────────────────────────────────────────

  it('renders an Import file input', () => {
    render(<Toolbar {...defaults} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.accept).toContain('.md');
  });
});
