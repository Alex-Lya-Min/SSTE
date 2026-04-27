import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { StatusBar } from './components/StatusBar';
import { Toolbar } from './components/Toolbar';
import { loadState, saveState } from './storage/localStorage';
import type { AppState, DocumentItem, SaveStatus, ViewMode } from './types';
import { createId, extractTitle, getUniqueTitle } from './utils/document';
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
  const [theme, setTheme] = useState<'light' | 'dark'>(initial.preferences.theme);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const autosaveRef = useRef<number | null>(null);

  const activeDocument = useMemo(
    () => documents.find((doc) => doc.id === activeDocumentId) ?? null,
    [activeDocumentId, documents]
  );

  const persist = useCallback(
    (nextDocuments: DocumentItem[], immediate = false) => {
      setSaveStatus(immediate ? 'saving' : 'unsaved');
      const state: AppState = {
        version: 1,
        documents: nextDocuments,
        preferences: {
          activeDocumentId,
          focusMode,
          viewMode,
          theme
        }
      };

      const saveNow = () => {
        saveState(state);
        setSaveStatus('saved');
      };

      if (immediate) {
        saveNow();
        return;
      }

      if (autosaveRef.current) window.clearTimeout(autosaveRef.current);
      autosaveRef.current = window.setTimeout(() => {
        setSaveStatus('saving');
        saveNow();
      }, AUTOSAVE_MS);
    },
    [activeDocumentId, focusMode, theme, viewMode]
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const state: AppState = {
      version: 1,
      documents,
      preferences: {
        activeDocumentId,
        viewMode,
        focusMode,
        theme
      }
    };
    saveState(state);
  }, [activeDocumentId, documents, focusMode, theme, viewMode]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();

      if (key === 's') {
        event.preventDefault();
        persist(documents, true);
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
          title: extractTitle(value),
          updatedAt: new Date().toISOString()
        };
        const nextDocs = documents.map((item) => (item.id === doc.id ? updatedDoc : item));
        setDocuments(nextDocs);
        requestAnimationFrame(() => {
          textareaRef.current?.focus();
          textareaRef.current?.setSelectionRange(start, end);
        });
        persist(nextDocs, false);
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
    persist(nextDocs, true);
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
    persist(nextDocs, true);
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
      persist(nextDocs, true);
      return;
    }

    const nextActive = nextDocs[idx] ?? nextDocs[idx - 1] ?? nextDocs[0];
    setActiveDocumentId(nextActive.id);
    persist(nextDocs, true);
  };

  const updateContent = (content: string) => {
    if (!activeDocument) return;
    const updated: DocumentItem = {
      ...activeDocument,
      content,
      title: activeDocument.title === 'Untitled' ? extractTitle(content) : activeDocument.title,
      updatedAt: new Date().toISOString()
    };
    const nextDocs = documents.map((item) => (item.id === activeDocument.id ? updated : item));
    setDocuments(nextDocs);
    persist(nextDocs, false);
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
    persist(nextDocs, true);
  };

  const exportFile = (kind: 'md' | 'txt') => {
    if (!activeDocument) return;
    const blob = new Blob([activeDocument.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${activeDocument.title || 'document'}.${kind}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const previewHtml = useMemo(() => renderMarkdown(activeDocument?.content ?? ''), [activeDocument?.content]);
  const stats = useMemo(() => getTextStats(activeDocument?.content ?? ''), [activeDocument?.content]);

  return (
    <div className={`app ${focusMode ? 'focus' : ''}`}>
      <Sidebar
        hidden={focusMode}
        documents={documents}
        activeDocumentId={activeDocumentId}
        onSelect={setActiveDocumentId}
        onCreate={createDocument}
        onRename={renameDocument}
        onDelete={deleteDocument}
      />

      <main className="main">
        <Toolbar
          hidden={focusMode}
          viewMode={viewMode}
          focusMode={focusMode}
          theme={theme}
          onChangeViewMode={setViewMode}
          onToggleFocus={() => setFocusMode((prev) => !prev)}
          onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
          onImport={importFile}
          onExport={exportFile}
        />

        {!activeDocument ? (
          <section className="empty-state">
            <h1>No document selected</h1>
            <p>Create a document or import .md/.txt to start writing.</p>
            <button onClick={createDocument}>Create document</button>
          </section>
        ) : (
          <section className={`workspace mode-${viewMode}`}>
            {(viewMode === 'write' || viewMode === 'split') && (
              <Editor value={activeDocument.content} onChange={updateContent} onMount={(el) => (textareaRef.current = el)} />
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
