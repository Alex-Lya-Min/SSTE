import '@testing-library/jest-dom';

// jsdom не реализует createObjectURL / revokeObjectURL
globalThis.URL.createObjectURL = () => 'blob:mock-url';
globalThis.URL.revokeObjectURL = () => {};
