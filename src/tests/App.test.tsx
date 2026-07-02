import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { EditorView } from '@codemirror/view';
import App from '../App';

// Приложение стартует в focusMode=true (Sidebar и Toolbar скрыты).
// Чтобы получить доступ к Sidebar, нужно сначала кликнуть "Normal mode".

// Редактор — CodeMirror: ввод текста симулируем через dispatch во view
const getEditorView = (): EditorView => {
  const content = document.querySelector('.cm-content') as HTMLElement | null;
  if (!content) throw new Error('CodeMirror content not found');
  const view = EditorView.findFromDOM(content);
  if (!view) throw new Error('CodeMirror view not found');
  return view;
};

const setEditorText = (text: string) => {
  const view = getEditorView();
  act(() => {
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });
  });
};

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  vi.spyOn(window, 'prompt').mockReturnValue('Renamed Title');
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Первый запуск ────────────────────────────────────────────────────────────

describe('App — initial render (focus mode)', () => {
  it('renders the Welcome demo document', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome' })).toBeInTheDocument();
  });

  it('starts in WRITE MODE', () => {
    render(<App />);
    expect(screen.getByText('WRITE MODE')).toBeInTheDocument();
  });

  it('shows focus-controls in focus mode', () => {
    render(<App />);
    expect(screen.getByText('Normal mode')).toBeInTheDocument();
  });

  it('hides sidebar in focus mode', () => {
    render(<App />);
    expect(screen.queryByText('Documents')).toBeNull();
  });

  it('shows status bar with word count', () => {
    render(<App />);
    expect(screen.getByText(/Words:/)).toBeInTheDocument();
  });

  it('renders a textarea for editing', () => {
    render(<App />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});

// ─── Focus mode ───────────────────────────────────────────────────────────────

describe('App — focus mode toggle', () => {
  it('exits focus mode when Normal mode clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    expect(screen.queryByText('Normal mode')).toBeNull();
    expect(screen.getByText('Calm mode')).toBeInTheDocument();
  });

  it('shows sidebar after exiting focus mode', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    expect(screen.getByText('Documents')).toBeInTheDocument();
  });

  it('re-enters focus mode when Calm mode clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('Calm mode'));
    expect(screen.getByText('Normal mode')).toBeInTheDocument();
  });
});

// ─── Режимы просмотра ─────────────────────────────────────────────────────────

describe('App — view mode switching (focus controls)', () => {
  it('switches to PREVIEW MODE via "Review" button', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Review'));
    expect(screen.getByText('PREVIEW MODE')).toBeInTheDocument();
  });

  it('switches to SPLIT MODE', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Split'));
    expect(screen.getByText('SPLIT MODE')).toBeInTheDocument();
  });

  it('switches back to WRITE MODE', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Review'));
    fireEvent.click(screen.getByText('Write'));
    expect(screen.getByText('WRITE MODE')).toBeInTheDocument();
  });

  it('shows editor in write mode', () => {
    render(<App />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows editor and preview in split mode', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Split'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(document.querySelector('.preview')).not.toBeNull();
  });

  it('hides editor in preview mode', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Review'));
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});

// ─── Тема ─────────────────────────────────────────────────────────────────────

describe('App — theme toggle', () => {
  it('toggles from light to dark', () => {
    render(<App />);
    // В focus-controls кнопка показывает "Dark" когда тема light
    fireEvent.click(screen.getByText('Dark'));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('toggles back to light', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Dark'));
    fireEvent.click(screen.getByText('Light'));
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});

// ─── Редактирование контента ──────────────────────────────────────────────────

describe('App — content editing', () => {
  it('updates word count after typing', async () => {
    render(<App />);
    setEditorText('one two three');
    await waitFor(() => {
      expect(screen.getByText('Words: 3')).toBeInTheDocument();
    });
  });

  it('updates character count after typing', async () => {
    render(<App />);
    setEditorText('hello');
    await waitFor(() => {
      expect(screen.getByText('Characters: 5')).toBeInTheDocument();
    });
  });

  it('auto-updates title from heading when title is Untitled', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('New'));

    setEditorText('# My New Title\n\nContent');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'My New Title' })).toBeInTheDocument();
    });
  });
});

// ─── Управление документами ───────────────────────────────────────────────────

describe('App — document management', () => {
  it('creates a new document', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('New'));
    // Новый документ должен появиться в сайдбаре
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it('switches active document when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('New'));
    // Кликаем на Welcome в сайдбаре
    const welcomeButton = screen.getByRole('button', { name: 'Welcome' });
    fireEvent.click(welcomeButton);
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome' })).toBeInTheDocument();
  });

  it('deletes a document after confirmation', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    // Создаём второй документ, чтобы можно было удалить один из них
    fireEvent.click(screen.getByText('New'));
    const deleteButtons = screen.getAllByText('Delete');
    const initialCount = screen.getAllByRole('listitem').length;
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.getAllByRole('listitem').length).toBe(initialCount - 1);
    });
  });

  it('calls window.confirm before deletion', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('Delete'));
    expect(window.confirm).toHaveBeenCalled();
  });

  it('does not delete when confirm returns false', async () => {
    vi.mocked(window.confirm).mockReturnValueOnce(false);
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    const initialCount = screen.getAllByRole('listitem').length;
    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getAllByRole('listitem').length).toBe(initialCount);
  });

  it('shows the selected document content in the editor', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('New'));
    expect(getEditorView().state.doc.toString()).toBe('');

    fireEvent.click(screen.getByRole('button', { name: 'Welcome' }));
    expect(getEditorView().state.doc.toString()).toContain('# Welcome');
  });

  it('does not leak undo history between documents (post-migration regression)', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('New'));
    setEditorText('draft text');

    fireEvent.click(screen.getByRole('button', { name: 'Welcome' }));
    const view = getEditorView();
    const before = view.state.doc.toString();
    fireEvent.keyDown(view.contentDOM, { key: 'z', ctrlKey: true });
    expect(view.state.doc.toString()).toBe(before);
  });

  it('renames a document', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('Rename'));
    expect(window.prompt).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Renamed Title' })).toBeInTheDocument();
    });
  });
});

// ─── Настройки ────────────────────────────────────────────────────────────────

describe('App — settings', () => {
  // Настройки доступны только в normal mode: сначала выходим из calm-режима
  const openSettings = () => {
    const normalModeButton = screen.queryByText('Normal mode');
    if (normalModeButton) fireEvent.click(normalModeButton);
    fireEvent.click(screen.getByText('Settings'));
    return within(screen.getByRole('complementary', { name: 'Settings' }));
  };

  it('opens settings as a sidebar panel (not a modal)', () => {
    render(<App />);
    openSettings();
    expect(screen.getByRole('complementary', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens settings from the toolbar in normal mode', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByRole('complementary', { name: 'Settings' })).toBeInTheDocument();
  });

  it('replaces the document list while settings are open', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    expect(screen.getByText('Documents')).toBeInTheDocument();
    openSettings();
    expect(screen.queryByText('Documents')).toBeNull();
  });

  it('restores the document list after closing settings', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    openSettings();
    fireEvent.click(screen.getByLabelText('Close settings'));
    expect(screen.getByText('Documents')).toBeInTheDocument();
  });

  it('closes settings via Done button', () => {
    render(<App />);
    openSettings();
    fireEvent.click(screen.getByLabelText('Close settings'));
    expect(screen.queryByRole('complementary', { name: 'Settings' })).toBeNull();
  });

  it('changes theme family to eighties and sets data attribute', () => {
    render(<App />);
    const dialog = openSettings();
    fireEvent.click(dialog.getByRole('button', { name: /'80s/ }));
    expect(document.documentElement.dataset.themeFamily).toBe('eighties');
  });

  it('changes theme family to nintendo and sets data attribute', () => {
    render(<App />);
    const dialog = openSettings();
    fireEvent.click(dialog.getByRole('button', { name: /Nintendo/ }));
    expect(document.documentElement.dataset.themeFamily).toBe('nintendo');
  });

  it('changes appearance to dark from settings', () => {
    render(<App />);
    const dialog = openSettings();
    fireEvent.click(within(dialog.getByRole('group', { name: 'Appearance' })).getByText('Dark'));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('changes UI scale and sets data attribute', () => {
    render(<App />);
    const dialog = openSettings();
    fireEvent.click(within(dialog.getByRole('group', { name: 'Interface size' })).getByText('L'));
    expect(document.documentElement.dataset.uiScale).toBe('l');
  });

  it('changes highlight theme and sets data attribute', () => {
    render(<App />);
    const dialog = openSettings();
    fireEvent.click(dialog.getByText('Monokai'));
    expect(document.documentElement.dataset.highlight).toBe('monokai');
  });

  it('toggles line numbers in the editor', () => {
    render(<App />);
    expect(document.querySelector('.cm-lineNumbers')).toBeNull();

    const dialog = openSettings();
    fireEvent.click(within(dialog.getByRole('group', { name: 'Line numbers' })).getByText('On'));
    expect(document.querySelector('.cm-lineNumbers')).not.toBeNull();

    fireEvent.click(within(dialog.getByRole('group', { name: 'Line numbers' })).getByText('Off'));
    expect(document.querySelector('.cm-lineNumbers')).toBeNull();
  });

  it('persists settings to localStorage', () => {
    render(<App />);
    const dialog = openSettings();
    fireEvent.click(dialog.getByText('VS Code'));
    fireEvent.click(within(dialog.getByRole('group', { name: 'Interface size' })).getByText('S'));
    fireEvent.click(within(dialog.getByRole('group', { name: 'Line numbers' })).getByText('On'));

    const saved = JSON.parse(localStorage.getItem('calm-writer-state-v1')!);
    expect(saved.preferences.highlightTheme).toBe('vscode');
    expect(saved.preferences.uiScale).toBe('s');
    expect(saved.preferences.lineNumbers).toBe(true);
  });

  it('restores settings after remount', () => {
    const first = render(<App />);
    const dialog = openSettings();
    fireEvent.click(dialog.getByRole('button', { name: /Nintendo/ }));
    first.unmount();

    render(<App />);
    expect(document.documentElement.dataset.themeFamily).toBe('nintendo');
  });
});

// ─── Настройки недоступны в calm mode (UI) ────────────────────────────────────

describe('App — settings availability in calm mode (UI)', () => {
  it('does not show a Settings button in calm mode', () => {
    render(<App />);
    // Стартуем в calm mode: focus-controls видны, кнопки Settings быть не должно
    expect(screen.getByText('Normal mode')).toBeInTheDocument();
    expect(screen.queryByText('Settings')).toBeNull();
  });

  it('shows the Settings button only after switching to normal mode', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('hides the Settings button again when returning to calm mode', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('Calm mode'));
    expect(screen.queryByText('Settings')).toBeNull();
  });

  it('closes an open settings panel when switching to calm mode', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByRole('complementary', { name: 'Settings' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('Calm mode'));
    expect(screen.queryByRole('complementary', { name: 'Settings' })).toBeNull();
  });

  it('never renders the settings panel alongside focus controls', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('Settings'));
    fireEvent.click(screen.getByText('Calm mode'));

    // В calm mode: focus-controls есть, панели настроек нет, сетка одноколоночная
    expect(screen.getByText('Normal mode')).toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: 'Settings' })).toBeNull();
    expect(document.querySelector('.app')).toHaveClass('focus');
  });

  it('reopens settings with the document list intact after a calm round-trip', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('Settings'));
    fireEvent.click(screen.getByText('Calm mode'));
    fireEvent.click(screen.getByText('Normal mode'));

    // После возврата в normal mode список документов на месте, настройки закрыты
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: 'Settings' })).toBeNull();
  });

  it('keeps applied settings after they are closed by calm mode', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('Settings'));
    const dialog = within(screen.getByRole('complementary', { name: 'Settings' }));
    fireEvent.click(dialog.getByText('Monokai'));

    fireEvent.click(screen.getByText('Calm mode'));
    // Настройка применена и сохранена, хотя панель закрылась
    expect(document.documentElement.dataset.highlight).toBe('monokai');
    const saved = JSON.parse(localStorage.getItem('calm-writer-state-v1')!);
    expect(saved.preferences.highlightTheme).toBe('monokai');
  });
});

// ─── Экспорт ──────────────────────────────────────────────────────────────────

describe('App — export', () => {
  it('does not crash when exporting as .md', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    expect(() => fireEvent.click(screen.getByText('Export .md'))).not.toThrow();
  });

  it('does not crash when exporting as .txt', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    expect(() => fireEvent.click(screen.getByText('Export .txt'))).not.toThrow();
  });
});

// ─── Состояние сохранения ─────────────────────────────────────────────────────

describe('App — save status', () => {
  it('shows Saved on initial load', () => {
    render(<App />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('shows Unsaved changes after editing', async () => {
    render(<App />);
    setEditorText('changed content');
    await waitFor(() => {
      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });
  });

  it('returns to Saved after autosave delay', async () => {
    render(<App />);
    setEditorText('changed');
    await waitFor(
      () => {
        expect(screen.getByText('Saved')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
