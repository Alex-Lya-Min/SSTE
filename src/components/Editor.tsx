import { useEffect, useRef } from 'react';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Annotation, EditorState } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { wrapSelection } from '../utils/editorShortcuts';

// Помечает транзакции, пришедшие из пропа value (переключение документа),
// чтобы не отправлять их обратно через onChange
const externalChange = Annotation.define<boolean>();

// Цвета берутся из CSS-переменных: схема подсветки и светлый/тёмный режим
// переключаются атрибутами data-highlight / data-theme на <html> без пересоздания вью
const markdownHighlight = HighlightStyle.define([
  { tag: tags.heading1, fontSize: '1.6em', fontWeight: '700', color: 'var(--md-heading)' },
  { tag: tags.heading2, fontSize: '1.35em', fontWeight: '700', color: 'var(--md-heading)' },
  { tag: tags.heading3, fontSize: '1.15em', fontWeight: '600', color: 'var(--md-heading)' },
  { tag: tags.heading4, fontWeight: '600', color: 'var(--md-heading)' },
  { tag: tags.heading5, fontWeight: '600', color: 'var(--md-heading)' },
  { tag: tags.heading6, fontWeight: '600', color: 'var(--md-heading)' },
  { tag: tags.strong, fontWeight: '700', color: 'var(--md-strong)' },
  { tag: tags.emphasis, fontStyle: 'italic', color: 'var(--md-emphasis)' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.link, color: 'var(--md-link)' },
  { tag: tags.url, color: 'var(--md-link)', textDecoration: 'underline' },
  {
    tag: tags.monospace,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: '0.9em',
    color: 'var(--md-code)'
  },
  { tag: tags.quote, color: 'var(--md-quote)', fontStyle: 'italic' },
  { tag: tags.processingInstruction, color: 'var(--md-mark)' },
  { tag: tags.meta, color: 'var(--md-mark)' }
]);

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  calmMode?: boolean;
}

export function Editor({ value, onChange, calmMode = false }: EditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          keymap.of([
            { key: 'Mod-b', run: (v) => wrapSelection(v, '**') },
            { key: 'Mod-i', run: (v) => wrapSelection(v, '*') },
            ...defaultKeymap,
            ...historyKeymap
          ]),
          markdown({ base: markdownLanguage }),
          syntaxHighlighting(markdownHighlight),
          EditorView.lineWrapping,
          placeholder('Write your markdown here...'),
          EditorView.contentAttributes.of({ spellcheck: 'true' }),
          EditorView.updateListener.of((update) => {
            if (!update.docChanged) return;
            if (update.transactions.some((tr) => tr.annotation(externalChange))) return;
            onChangeRef.current(update.state.doc.toString());
          })
        ]
      }),
      parent: containerRef.current
    });

    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Вью создаётся один раз; дальнейшие изменения value применяет эффект ниже
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (value === current) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
      annotations: externalChange.of(true)
    });
  }, [value]);

  const isEmpty = value.trim().length === 0;

  return (
    <div
      ref={containerRef}
      className={`editor-shell ${isEmpty ? 'is-empty' : ''} typewriter-mode ${calmMode ? 'is-calm' : ''}`}
    />
  );
}
