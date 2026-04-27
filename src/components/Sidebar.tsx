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

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Documents</h2>
        <button onClick={onCreate}>New</button>
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
