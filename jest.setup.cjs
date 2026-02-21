require('@testing-library/jest-dom');

// react-router uses TextEncoder / TextDecoder which jsdom doesn't expose globally
const { TextEncoder, TextDecoder } = require('util');
Object.assign(globalThis, { TextEncoder, TextDecoder });
