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

  useEffect(() => {
    if (!calmMode || !ref.current) return;

    const textarea = ref.current;

    const syncCaretToViewportCenter = () => {
      if (!textarea) return;

      const styles = window.getComputedStyle(textarea);
      const mirror = document.createElement('div');

      mirror.style.position = 'absolute';
      mirror.style.visibility = 'hidden';
      mirror.style.pointerEvents = 'none';
      mirror.style.zIndex = '-1';
      mirror.style.whiteSpace = 'pre-wrap';
      mirror.style.overflowWrap = 'break-word';
      mirror.style.wordBreak = 'break-word';
      mirror.style.boxSizing = styles.boxSizing;
      mirror.style.width = `${textarea.clientWidth}px`;
      mirror.style.font = styles.font;
      mirror.style.letterSpacing = styles.letterSpacing;
      mirror.style.lineHeight = styles.lineHeight;
      mirror.style.padding = styles.padding;
      mirror.style.border = styles.border;

      const caretIndex = textarea.selectionStart ?? value.length;
      mirror.textContent = value.slice(0, caretIndex);

      const marker = document.createElement('span');
      marker.textContent = '\u200b';
      mirror.appendChild(marker);
      document.body.appendChild(mirror);

      const lineHeight = Number.parseFloat(styles.lineHeight) || 32;
      const targetScroll = marker.offsetTop - textarea.clientHeight / 2 + lineHeight;
      textarea.scrollTop = Math.max(0, targetScroll);

      document.body.removeChild(mirror);
    };

    syncCaretToViewportCenter();

    textarea.addEventListener('input', syncCaretToViewportCenter);
    textarea.addEventListener('click', syncCaretToViewportCenter);
    textarea.addEventListener('keyup', syncCaretToViewportCenter);

    return () => {
      textarea.removeEventListener('input', syncCaretToViewportCenter);
      textarea.removeEventListener('click', syncCaretToViewportCenter);
      textarea.removeEventListener('keyup', syncCaretToViewportCenter);
    };
  }, [calmMode, value]);

  return (
    <div
      className={`editor-shell ${isEmpty ? 'is-empty' : ''} ${calmMode ? 'is-calm typewriter-mode' : ''}`}
    >
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
