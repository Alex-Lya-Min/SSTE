import type { EditorView } from '@codemirror/view';

export const wrapSelection = (view: EditorView, wrapper: string): boolean => {
  const { from, to } = view.state.selection.main;
  view.dispatch({
    changes: [
      { from, insert: wrapper },
      { from: to, insert: wrapper }
    ],
    selection: { anchor: from + wrapper.length, head: to + wrapper.length },
    scrollIntoView: true,
    userEvent: 'input'
  });
  return true;
};
