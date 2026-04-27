import type { DocumentItem } from '../types';

interface SidebarProps {
  documents: DocumentItem[];
  activeDocumentId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  hidden?: boolean;
}

export function Sidebar({
  documents,
  activeDocumentId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  hidden = false
}: SidebarProps) {
  if (hidden) return null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <p className="eyebrow">Library</p>
          <h2>Documents</h2>
        </div>
        <button onClick={onCreate} className="button-primary">
          New
        </button>
      </div>
      {documents.length === 0 ? (
        <p className="empty">No documents yet</p>
      ) : (
        <ul className="doc-list">
          {documents.map((doc) => (
            <li key={doc.id} className={doc.id === activeDocumentId ? 'active' : ''}>
              <button className="doc-title" onClick={() => onSelect(doc.id)}>
                {doc.title}
              </button>
              <p className="doc-meta">Updated {formatDate(doc.updatedAt)}</p>
              <div className="doc-actions">
                <button onClick={() => onRename(doc.id)}>Rename</button>
                <button onClick={() => onDelete(doc.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
