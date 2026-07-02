import type { AppState, DocumentItem, HighlightTheme, Preferences, Theme, ThemeFamily, UiScale, ViewMode } from '../types';
import { createDemoDocument } from '../utils/document';

const STORAGE_KEY = 'calm-writer-state-v1';

const VIEW_MODES: readonly ViewMode[] = ['write', 'preview', 'split'];
const THEMES: readonly Theme[] = ['light', 'dark'];
const THEME_FAMILIES: readonly ThemeFamily[] = ['classic', 'eighties', 'nintendo'];
const UI_SCALES: readonly UiScale[] = ['s', 'm', 'l'];
const HIGHLIGHT_THEMES: readonly HighlightTheme[] = ['default', 'vscode', 'monokai', 'solarized'];

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

const getDefaultPreferences = (docId: string | null): Preferences => ({
  activeDocumentId: docId,
  viewMode: 'write',
  focusMode: true,
  theme: 'light',
  themeFamily: 'classic',
  uiScale: 'm',
  highlightTheme: 'default',
  lineNumbers: false
});

const createInitialState = (): AppState => {
  const demo = createDemoDocument();
  return {
    version: 1,
    documents: [demo],
    preferences: getDefaultPreferences(demo.id)
  };
};

const isDocument = (value: unknown): value is DocumentItem => {
  if (!value || typeof value !== 'object') return false;
  const doc = value as Record<string, unknown>;
  return (
    typeof doc.id === 'string' &&
    typeof doc.title === 'string' &&
    typeof doc.content === 'string' &&
    typeof doc.createdAt === 'string' &&
    typeof doc.updatedAt === 'string'
  );
};

export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();

    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed.version !== 1 || !Array.isArray(parsed.documents)) {
      return createInitialState();
    }

    const documents = parsed.documents.filter(isDocument);

    const preferences = parsed.preferences;
    const activeDocumentId =
      preferences?.activeDocumentId && documents.some((doc) => doc.id === preferences.activeDocumentId)
        ? preferences.activeDocumentId
        : documents[0]?.id ?? null;

    return {
      version: 1,
      documents,
      preferences: {
        activeDocumentId,
        viewMode: pick(preferences?.viewMode, VIEW_MODES, 'write'),
        focusMode: typeof preferences?.focusMode === 'boolean' ? preferences.focusMode : true,
        theme: pick(preferences?.theme, THEMES, 'light'),
        themeFamily: pick(preferences?.themeFamily, THEME_FAMILIES, 'classic'),
        uiScale: pick(preferences?.uiScale, UI_SCALES, 'm'),
        highlightTheme: pick(preferences?.highlightTheme, HIGHLIGHT_THEMES, 'default'),
        lineNumbers: typeof preferences?.lineNumbers === 'boolean' ? preferences.lineNumbers : false
      }
    };
  } catch {
    return createInitialState();
  }
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // QuotaExceededError or SecurityError in restricted environments
  }
};
