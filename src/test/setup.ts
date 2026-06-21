import '@testing-library/jest-dom';

// jsdom does not implement matchMedia. Provide a default stub (motion allowed)
// so components that read prefers-reduced-motion render in tests. Individual
// tests may override window.matchMedia to assert specific behavior.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
