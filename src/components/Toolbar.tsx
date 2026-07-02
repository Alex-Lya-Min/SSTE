import type { Theme, ViewMode } from '../types';

interface ToolbarProps {
  viewMode: ViewMode;
  focusMode: boolean;
  theme: Theme;
  onChangeViewMode: (mode: ViewMode) => void;
  onToggleFocus: () => void;
  onToggleTheme: () => void;
  onImport: (file: File) => void;
  onExport: (kind: 'md' | 'txt') => void;
  onOpenSettings: () => void;
  canExport: boolean;
  hidden?: boolean;
}

export function Toolbar({
  viewMode,
  focusMode,
  theme,
  onChangeViewMode,
  onToggleFocus,
  onToggleTheme,
  onImport,
  onExport,
  onOpenSettings,
  canExport,
  hidden = false
}: ToolbarProps) {
  if (hidden) return null;

  return (
    <header className="toolbar">
      <div className="group">
        <button onClick={() => onChangeViewMode('write')} className={viewMode === 'write' ? 'active' : ''}>
          Write
        </button>
        <button onClick={() => onChangeViewMode('preview')} className={viewMode === 'preview' ? 'active' : ''}>
          Preview
        </button>
        <button onClick={() => onChangeViewMode('split')} className={viewMode === 'split' ? 'active' : ''}>
          Split
        </button>
      </div>

      <div className="group">
        <label className="import-label">
          Import
          <input
            type="file"
            accept=".md,.txt,text/markdown,text/plain"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImport(file);
              e.currentTarget.value = '';
            }}
          />
        </label>
        <button onClick={() => onExport('md')} disabled={!canExport}>
          Export .md
        </button>
        <button onClick={() => onExport('txt')} disabled={!canExport}>
          Export .txt
        </button>
      </div>

      <div className="group">
        <button onClick={onToggleFocus} className={focusMode ? 'active' : ''}>
          Calm mode
        </button>
        <button onClick={onToggleTheme}>{theme === 'light' ? 'Dark' : 'Light'}</button>
        <button onClick={onOpenSettings}>Settings</button>
      </div>
    </header>
  );
}
