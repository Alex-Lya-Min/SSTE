export type ViewMode = 'write' | 'preview' | 'split';
export type Theme = 'light' | 'dark';
export type SaveStatus = 'saved' | 'saving' | 'unsaved';

export interface DocumentItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Preferences {
  activeDocumentId: string | null;
  viewMode: ViewMode;
  focusMode: boolean;
  theme: Theme;
}

export interface AppState {
  version: 1;
  documents: DocumentItem[];
  preferences: Preferences;
}
