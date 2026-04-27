export const wrapSelection = (
  textarea: HTMLTextAreaElement,
  wrapper: string
): { value: string; start: number; end: number } => {
  const value = textarea.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);

  const wrapped = `${wrapper}${selected}${wrapper}`;
  const nextValue = `${value.slice(0, start)}${wrapped}${value.slice(end)}`;

  return {
    value: nextValue,
    start: start + wrapper.length,
    end: end + wrapper.length
  };
};
