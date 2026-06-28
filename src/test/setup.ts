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

// jsdom does not implement ResizeObserver. ClickSpark uses it to keep its
// canvas in sync with its parent dimensions; a no-op stub lets it render.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}

// jsdom does not implement IntersectionObserver. Framer Motion's whileInView
// constructs one on mount; provide a no-op stub so scroll-reveal components
// render in tests (children are in the DOM regardless of in-view state).
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = '';
    thresholds = [];
  }
  globalThis.IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver;
}
