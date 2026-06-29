import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Приложение стартует в focusMode=true (Sidebar и Toolbar скрыты).
// Чтобы получить доступ к Sidebar, нужно сначала кликнуть "Normal mode".

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
    expect(screen.getByText('Welcome')).toBeInTheDocument();
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
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'one two three' } });
    await waitFor(() => {
      expect(screen.getByText('Words: 3')).toBeInTheDocument();
    });
  });

  it('updates character count after typing', async () => {
    render(<App />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'hello' } });
    await waitFor(() => {
      expect(screen.getByText('Characters: 5')).toBeInTheDocument();
    });
  });

  it('auto-updates title from heading when title is Untitled', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Normal mode'));
    fireEvent.click(screen.getByText('New'));

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '# My New Title\n\nContent' } });

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
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'changed content' } });
    await waitFor(() => {
      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });
  });

  it('returns to Saved after autosave delay', async () => {
    render(<App />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'changed' } });
    await waitFor(
      () => {
        expect(screen.getByText('Saved')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
