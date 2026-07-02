import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadState, saveState } from '../../storage/localStorage';
import type { AppState } from '../../types';

const STORAGE_KEY = 'calm-writer-state-v1';

const validState: AppState = {
  version: 1,
  documents: [
    {
      id: 'doc-1',
      title: 'Test Doc',
      content: 'Hello world',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  preferences: {
    activeDocumentId: 'doc-1',
    viewMode: 'write',
    focusMode: false,
    theme: 'light',
    themeFamily: 'classic',
    uiScale: 'm',
    highlightTheme: 'default',
  },
};

// ─── loadState ────────────────────────────────────────────────────────────────

describe('loadState', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns initial state when localStorage is empty', () => {
    const state = loadState();
    expect(state.version).toBe(1);
    expect(state.documents.length).toBeGreaterThan(0);
    expect(state.preferences).toBeDefined();
  });

  it('initial state contains a Welcome demo document', () => {
    const state = loadState();
    expect(state.documents[0].title).toBe('Welcome');
  });

  it('initial state has focusMode enabled by default', () => {
    const state = loadState();
    expect(state.preferences.focusMode).toBe(true);
  });

  it('initial state has write viewMode by default', () => {
    const state = loadState();
    expect(state.preferences.viewMode).toBe('write');
  });

  it('loads a valid saved state correctly', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validState));
    const state = loadState();
    expect(state.documents).toHaveLength(1);
    expect(state.documents[0].title).toBe('Test Doc');
    expect(state.preferences.activeDocumentId).toBe('doc-1');
  });

  it('returns initial state for wrong version number', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...validState, version: 2 }));
    const state = loadState();
    expect(state.documents[0].title).toBe('Welcome');
  });

  it('returns initial state for corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{');
    const state = loadState();
    expect(state.documents[0].title).toBe('Welcome');
  });

  it('returns initial state when documents field is missing', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1 }));
    const state = loadState();
    expect(state.documents[0].title).toBe('Welcome');
  });

  it('filters out invalid documents', () => {
    const withBadDoc = {
      ...validState,
      documents: [validState.documents[0], { id: 123, title: null }],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withBadDoc));
    const state = loadState();
    expect(state.documents).toHaveLength(1);
    expect(state.documents[0].title).toBe('Test Doc');
  });

  it('falls back to first doc when activeDocumentId points to missing doc', () => {
    const withMissingId = {
      ...validState,
      preferences: { ...validState.preferences, activeDocumentId: 'non-existent' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withMissingId));
    const state = loadState();
    expect(state.preferences.activeDocumentId).toBe('doc-1');
  });

  it('falls back to write mode for invalid viewMode', () => {
    const withBadMode = {
      ...validState,
      preferences: { ...validState.preferences, viewMode: 'invalid' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withBadMode));
    const state = loadState();
    expect(state.preferences.viewMode).toBe('write');
  });

  it('preserves split viewMode', () => {
    const withSplit = {
      ...validState,
      preferences: { ...validState.preferences, viewMode: 'split' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withSplit));
    expect(loadState().preferences.viewMode).toBe('split');
  });

  it('defaults theme to light for unknown theme value', () => {
    const withBadTheme = {
      ...validState,
      preferences: { ...validState.preferences, theme: 'blue' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withBadTheme));
    expect(loadState().preferences.theme).toBe('light');
  });

  it('preserves dark theme', () => {
    const withDark = {
      ...validState,
      preferences: { ...validState.preferences, theme: 'dark' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withDark));
    expect(loadState().preferences.theme).toBe('dark');
  });

  it('defaults focusMode to true when not a boolean', () => {
    const withBadFocus = {
      ...validState,
      preferences: { ...validState.preferences, focusMode: 'yes' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withBadFocus));
    expect(loadState().preferences.focusMode).toBe(true);
  });

  // ── Новые настройки (themeFamily / uiScale / highlightTheme) ─────────────

  it('defaults new preferences when missing (old saved state)', () => {
    const legacy = {
      ...validState,
      preferences: {
        activeDocumentId: 'doc-1',
        viewMode: 'write',
        focusMode: false,
        theme: 'dark',
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const prefs = loadState().preferences;
    expect(prefs.themeFamily).toBe('classic');
    expect(prefs.uiScale).toBe('m');
    expect(prefs.highlightTheme).toBe('default');
    expect(prefs.theme).toBe('dark');
  });

  it('preserves valid themeFamily', () => {
    const state = {
      ...validState,
      preferences: { ...validState.preferences, themeFamily: 'eighties' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    expect(loadState().preferences.themeFamily).toBe('eighties');
  });

  it('falls back to classic for unknown themeFamily', () => {
    const state = {
      ...validState,
      preferences: { ...validState.preferences, themeFamily: 'sega' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    expect(loadState().preferences.themeFamily).toBe('classic');
  });

  it('preserves valid uiScale', () => {
    const state = {
      ...validState,
      preferences: { ...validState.preferences, uiScale: 'l' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    expect(loadState().preferences.uiScale).toBe('l');
  });

  it('falls back to m for unknown uiScale', () => {
    const state = {
      ...validState,
      preferences: { ...validState.preferences, uiScale: 'xxl' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    expect(loadState().preferences.uiScale).toBe('m');
  });

  it('preserves valid highlightTheme', () => {
    const state = {
      ...validState,
      preferences: { ...validState.preferences, highlightTheme: 'monokai' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    expect(loadState().preferences.highlightTheme).toBe('monokai');
  });

  it('falls back to default for unknown highlightTheme', () => {
    const state = {
      ...validState,
      preferences: { ...validState.preferences, highlightTheme: 'dracula' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    expect(loadState().preferences.highlightTheme).toBe('default');
  });
});

// ─── saveState ────────────────────────────────────────────────────────────────

describe('saveState', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves state to localStorage', () => {
    saveState(validState);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).documents[0].title).toBe('Test Doc');
  });

  it('overwrites previous state', () => {
    saveState(validState);
    const modified = {
      ...validState,
      documents: [{ ...validState.documents[0], title: 'Updated' }],
    };
    saveState(modified);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(raw!).documents[0].title).toBe('Updated');
  });

  // Регрессионный тест на баг #1: saveState должен молча игнорировать ошибки
  it('does not throw on QuotaExceededError', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => saveState(validState)).not.toThrow();
  });

  it('does not throw on SecurityError', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('SecurityError');
    });
    expect(() => saveState(validState)).not.toThrow();
  });

  it('round-trips through loadState correctly', () => {
    saveState(validState);
    const loaded = loadState();
    expect(loaded.documents[0].title).toBe('Test Doc');
    expect(loaded.preferences.theme).toBe('light');
    expect(loaded.preferences.viewMode).toBe('write');
  });
});
