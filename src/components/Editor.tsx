import { useEffect, useRef } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onMount?: (textarea: HTMLTextAreaElement) => void;
  calmMode?: boolean;
}

export function Editor({ value, onChange, onMount, calmMode = false }: EditorProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const isEmpty = value.trim().length === 0;

  useEffect(() => {
    if (ref.current && onMount) onMount(ref.current);
  }, [onMount]);

  return (
    <div className={`editor-shell ${isEmpty ? 'is-empty' : ''} ${calmMode ? 'is-calm' : ''}`}>
      <textarea
        ref={ref}
        className="editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your markdown here..."
        spellCheck
      />
    </div>
  );
}
