import { useEffect } from 'react';
import type { HighlightTheme, Theme, ThemeFamily, UiScale } from '../types';

interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

const themeOptions: Option<Theme>[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
];

const familyOptions: Option<ThemeFamily>[] = [
  { value: 'classic', label: 'Classic', hint: 'Tailwind / VS Code' },
  { value: 'eighties', label: "'80s", hint: 'Synthwave neon' },
  { value: 'nintendo', label: 'Nintendo', hint: 'Retro console' }
];

const scaleOptions: Option<UiScale>[] = [
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' }
];

const highlightOptions: Option<HighlightTheme>[] = [
  { value: 'default', label: 'Default' },
  { value: 'vscode', label: 'VS Code' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'solarized', label: 'Solarized' }
];

interface OptionGroupProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

function OptionGroup<T extends string>({ label, options, value, onChange }: OptionGroupProps<T>) {
  return (
    <div className="settings-field">
      <span className="settings-label">{label}</span>
      <div className="settings-options" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            className={option.value === value ? 'active' : ''}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {option.hint && <small>{option.hint}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SettingsProps {
  open: boolean;
  onClose: () => void;
  theme: Theme;
  themeFamily: ThemeFamily;
  uiScale: UiScale;
  highlightTheme: HighlightTheme;
  onChangeTheme: (theme: Theme) => void;
  onChangeThemeFamily: (family: ThemeFamily) => void;
  onChangeUiScale: (scale: UiScale) => void;
  onChangeHighlightTheme: (highlight: HighlightTheme) => void;
}

export function Settings({
  open,
  onClose,
  theme,
  themeFamily,
  uiScale,
  highlightTheme,
  onChangeTheme,
  onChangeThemeFamily,
  onChangeUiScale,
  onChangeHighlightTheme
}: SettingsProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <section
        className="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="settings-header">
          <h2>Settings</h2>
          <button onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </header>

        <OptionGroup label="Appearance" options={themeOptions} value={theme} onChange={onChangeTheme} />
        <OptionGroup label="Theme" options={familyOptions} value={themeFamily} onChange={onChangeThemeFamily} />
        <OptionGroup
          label="Editor highlighting"
          options={highlightOptions}
          value={highlightTheme}
          onChange={onChangeHighlightTheme}
        />
        <OptionGroup label="Interface size" options={scaleOptions} value={uiScale} onChange={onChangeUiScale} />
      </section>
    </div>
  );
}
