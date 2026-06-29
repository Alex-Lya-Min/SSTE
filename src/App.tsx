import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { StatusBar } from './components/StatusBar';
import { Toolbar } from './components/Toolbar';
import { loadState, saveState } from './storage/localStorage';
import type { AppState, DocumentItem, Preferences, SaveStatus, Theme, ViewMode } from './types';
import { createId, extractTitle, getUniqueTitle, isUntitledTitle } from './utils/document';
import { wrapSelection } from './utils/editorShortcuts';
import { renderMarkdown } from './utils/markdown';
import { getTextStats } from './utils/textStats';

const AUTOSAVE_MS = 500;

function App() {
  const initial = useMemo(() => loadState(), []);
  const [documents, setDocuments] = useState<DocumentItem[]>(initial.documents);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(initial.preferences.activeDocumentId);
  const [viewMode, setViewMode] = useState<ViewMode>(initial.preferences.viewMode);
  const [focusMode, setFocusMode] = useState<boolean>(initial.preferences.focusMode);
  const [theme, setTheme] = useState<Theme>(initial.preferences.theme);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const autosaveRef = useRef<number | null>(null);

  const activeDocument = useMemo(
    () => documents.find((doc) => doc.id === activeDocumentId) ?? null,
    [activeDocumentId, documents]
  );

  const persist = useCallback(
    (
      nextDocuments: DocumentItem[],
      options: { immediate?: boolean; preferences?: Partial<Preferences> } = {}
    ) => {
      const { immediate = false, preferences = {} } = options;
      setSaveStatus(immediate ? 'saving' : 'unsaved');
      const state: AppState = {
        version: 1,
        documents: nextDocuments,
        preferences: {
          activeDocumentId,
          focusMode,
          viewMode,
          theme,
          ...preferences
        }
      };

      const saveNow = () => {
        saveState(state);
        setSaveStatus('saved');
      };

      if (autosaveRef.current) {
        window.clearTimeout(autosaveRef.current);
        autosaveRef.current = null;
      }

      if (immediate) {
        saveNow();
        return;
      }

      autosaveRef.current = window.setTimeout(() => {
        setSaveStatus('saving');
        saveNow();
        autosaveRef.current = null;
      }, AUTOSAVE_MS);
    },
    [activeDocumentId, focusMode, theme, viewMode]
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(
    () => () => {
      if (autosaveRef.current) window.clearTimeout(autosaveRef.current);
    },
    []
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();

      if (key === 's') {
        event.preventDefault();
        persist(documents, { immediate: true });
        return;
      }

      if (!textareaRef.current || document.activeElement !== textareaRef.current) return;

      if (key === 'b' || key === 'i') {
        event.preventDefault();
        const wrapper = key === 'b' ? '**' : '*';
        const { value, start, end } = wrapSelection(textareaRef.current, wrapper);
        const doc = activeDocument;
        if (!doc) return;
        const updatedDoc: DocumentItem = {
          ...doc,
          content: value,
          title: isUntitledTitle(doc.title) ? extractTitle(value) : doc.title,
          updatedAt: new Date().toISOString()
        };
        const nextDocs = documents.map((item) => (item.id === doc.id ? updatedDoc : item));
        setDocuments(nextDocs);
        requestAnimationFrame(() => {
          textareaRef.current?.focus();
          textareaRef.current?.setSelectionRange(start, end);
        });
        persist(nextDocs);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeDocument, documents, persist]);

  const createDocument = () => {
    const now = new Date().toISOString();
    const newDoc: DocumentItem = {
      id: createId(),
      title: getUniqueTitle('Untitled', documents),
      content: '',
      createdAt: now,
      updatedAt: now
    };
    const nextDocs = [newDoc, ...documents];
    setDocuments(nextDocs);
    setActiveDocumentId(newDoc.id);
    persist(nextDocs, { immediate: true, preferences: { activeDocumentId: newDoc.id } });
  };

  const selectDocument = (id: string) => {
    setActiveDocumentId(id);
    persist(documents, { immediate: true, preferences: { activeDocumentId: id } });
  };

  const renameDocument = (id: string) => {
    const doc = documents.find((item) => item.id === id);
    if (!doc) return;
    const nextName = window.prompt('Rename document', doc.title)?.trim();
    if (!nextName) return;

    const uniqueTitle = getUniqueTitle(nextName, documents.filter((item) => item.id !== id));
    const nextDocs = documents.map((item) =>
      item.id === id ? { ...item, title: uniqueTitle, updatedAt: new Date().toISOString() } : item
    );
    setDocuments(nextDocs);
    persist(nextDocs, { immediate: true });
  };

  const deleteDocument = (id: string) => {
    const doc = documents.find((item) => item.id === id);
    if (!doc) return;
    const ok = window.confirm(`Delete "${doc.title}"?`);
    if (!ok) return;

    const idx = documents.findIndex((item) => item.id === id);
    const nextDocs = documents.filter((item) => item.id !== id);
    setDocuments(nextDocs);

    if (nextDocs.length === 0) {
      setActiveDocumentId(null);
      persist(nextDocs, { immediate: true, preferences: { activeDocumentId: null } });
      return;
    }

    const nextActive = nextDocs[idx] ?? nextDocs[idx - 1] ?? nextDocs[0];
    setActiveDocumentId(nextActive.id);
    persist(nextDocs, { immediate: true, preferences: { activeDocumentId: nextActive.id } });
  };

  const updateContent = (content: string) => {
    if (!activeDocument) return;
    const updated: DocumentItem = {
      ...activeDocument,
      content,
      title: isUntitledTitle(activeDocument.title) ? extractTitle(content) : activeDocument.title,
      updatedAt: new Date().toISOString()
    };
    const nextDocs = documents.map((item) => (item.id === activeDocument.id ? updated : item));
    setDocuments(nextDocs);
    persist(nextDocs);
  };

  const importFile = async (file: File) => {
    const text = await file.text();
    const now = new Date().toISOString();
    const nameWithoutExt = file.name.replace(/\.(md|txt)$/i, '');
    const title = getUniqueTitle(nameWithoutExt || extractTitle(text), documents);
    const imported: DocumentItem = {
      id: createId(),
      title,
      content: text,
      createdAt: now,
      updatedAt: now
    };

    const nextDocs = [imported, ...documents];
    setDocuments(nextDocs);
    setActiveDocumentId(imported.id);
    persist(nextDocs, { immediate: true, preferences: { activeDocumentId: imported.id } });
  };

  const exportFile = (kind: 'md' | 'txt') => {
    if (!activeDocument) return;
    const blob = new Blob([activeDocument.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${activeDocument.title || 'document'}.${kind}`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const previewHtml = useMemo(() => renderMarkdown(activeDocument?.content ?? ''), [activeDocument?.content]);
  const stats = useMemo(() => getTextStats(activeDocument?.content ?? ''), [activeDocument?.content]);

  const saveCurrentDocument = () => {
    if (!activeDocument) return;
    persist(documents, { immediate: true });
  };

  const changeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    persist(documents, { immediate: true, preferences: { viewMode: mode } });
  };

  const toggleFocusMode = () => {
    const next = !focusMode;
    setFocusMode(next);
    persist(documents, { immediate: true, preferences: { focusMode: next } });
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    persist(documents, { immediate: true, preferences: { theme: next } });
  };

  return (
    <div className={`app calm-synced ${focusMode ? 'focus' : ''}`}>
      <Sidebar
        hidden={focusMode}
        documents={documents}
        activeDocumentId={activeDocumentId}
        onSelect={selectDocument}
        onCreate={createDocument}
        onRename={renameDocument}
        onDelete={deleteDocument}
      />

      <main className="main">
        {focusMode && (
          <div className="focus-controls">
            <div className="focus-view-group" role="group" aria-label="View mode">
              <button onClick={() => changeViewMode('write')} className={viewMode === 'write' ? 'active' : ''}>
                Write
              </button>
              <button onClick={() => changeViewMode('preview')} className={viewMode === 'preview' ? 'active' : ''}>
                Review
              </button>
              <button onClick={() => changeViewMode('split')} className={viewMode === 'split' ? 'active' : ''}>
                Split
              </button>
            </div>
            <button onClick={saveCurrentDocument} disabled={!activeDocument}>Save</button>
            <button onClick={toggleFocusMode}>Normal mode</button>
            <button onClick={toggleTheme}>
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>
        )}

        <Toolbar
          hidden={focusMode}
          viewMode={viewMode}
          focusMode={focusMode}
          theme={theme}
          onChangeViewMode={changeViewMode}
          onToggleFocus={toggleFocusMode}
          onToggleTheme={toggleTheme}
          onImport={importFile}
          onExport={exportFile}
          canExport={Boolean(activeDocument)}
        />

        {!activeDocument ? (
          <section className="empty-state">
            <h1>No document selected</h1>
            <p>Create a document or import .md/.txt to start writing.</p>
            <button onClick={createDocument}>Create document</button>
          </section>
        ) : (
          <section className={`workspace mode-${viewMode}`}>
            <header className="document-header">
              <h1>{activeDocument.title}</h1>
              <p>{viewMode.toUpperCase()} MODE</p>
            </header>
            {(viewMode === 'write' || viewMode === 'split') && (
              <Editor
                value={activeDocument.content}
                onChange={updateContent}
                onMount={(el) => (textareaRef.current = el)}
                calmMode
              />
            )}
            {(viewMode === 'preview' || viewMode === 'split') && <Preview html={previewHtml} />}
          </section>
        )}

        <StatusBar saveStatus={saveStatus} stats={stats} updatedAt={activeDocument?.updatedAt} />
      </main>
    </div>
  );
}

export default App;
