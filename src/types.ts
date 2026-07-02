export type ViewMode = 'write' | 'preview' | 'split';
export type Theme = 'light' | 'dark';
export type ThemeFamily = 'classic' | 'eighties' | 'nintendo';
export type UiScale = 's' | 'm' | 'l';
export type HighlightTheme = 'default' | 'vscode' | 'monokai' | 'solarized';
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
  themeFamily: ThemeFamily;
  uiScale: UiScale;
  highlightTheme: HighlightTheme;
  lineNumbers: boolean;
}

export interface AppState {
  version: 1;
  documents: DocumentItem[];
  preferences: Preferences;
}
