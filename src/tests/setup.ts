import '@testing-library/jest-dom';

// jsdom не реализует layout API, которые CodeMirror использует для измерения текста
const zeroRect = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  toJSON: () => ({})
};

Range.prototype.getBoundingClientRect = () => zeroRect as DOMRect;
Range.prototype.getClientRects = () =>
  Object.assign([], { item: () => null }) as unknown as DOMRectList;

// jsdom не реализует createObjectURL / revokeObjectURL
globalThis.URL.createObjectURL = () => 'blob:mock-url';
globalThis.URL.revokeObjectURL = () => {};
