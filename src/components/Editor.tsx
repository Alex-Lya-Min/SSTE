import { useEffect, useRef } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onMount?: (textarea: HTMLTextAreaElement) => void;
}

export function Editor({ value, onChange, onMount }: EditorProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (ref.current && onMount) onMount(ref.current);
  }, [onMount]);

  return (
    <textarea
      ref={ref}
      className="editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Write your markdown here..."
      spellCheck
    />
  );
}
