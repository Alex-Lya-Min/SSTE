import type { SaveStatus } from '../types';
import type { TextStats } from '../utils/textStats';

interface StatusBarProps {
  saveStatus: SaveStatus;
  stats: TextStats;
  updatedAt?: string;
}

const saveLabel: Record<SaveStatus, string> = {
  saved: 'Saved',
  saving: 'Saving…',
  unsaved: 'Unsaved changes'
};

export function StatusBar({ saveStatus, stats, updatedAt }: StatusBarProps) {
  return (
    <footer className="statusbar">
      <span>{saveLabel[saveStatus]}</span>
      <span>Words: {stats.words}</span>
      <span>Characters: {stats.characters}</span>
      <span>Reading: ~{stats.readingMinutes} min</span>
      {updatedAt && <span>Updated: {new Date(updatedAt).toLocaleString()}</span>}
    </footer>
  );
}
