import type { AppState, DocumentItem, Preferences } from '../types';
import { createDemoDocument } from '../utils/document';

const STORAGE_KEY = 'calm-writer-state-v1';

const getDefaultPreferences = (docId: string): Preferences => ({
  activeDocumentId: docId,
  viewMode: 'write',
  focusMode: false,
  theme: 'light'
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
    if (documents.length === 0) return createInitialState();

    const preferences = parsed.preferences;
    const activeDocumentId =
      preferences?.activeDocumentId && documents.some((doc) => doc.id === preferences.activeDocumentId)
        ? preferences.activeDocumentId
        : documents[0].id;

    return {
      version: 1,
      documents,
      preferences: {
        activeDocumentId,
        viewMode:
          preferences?.viewMode === 'write' || preferences?.viewMode === 'preview' || preferences?.viewMode === 'split'
            ? preferences.viewMode
            : 'write',
        focusMode: Boolean(preferences?.focusMode),
        theme: preferences?.theme === 'dark' ? 'dark' : 'light'
      }
    };
  } catch {
    return createInitialState();
  }
};

export const saveState = (state: AppState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
