import { describe, it, expect, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { Typewriter } from './Typewriter';

const realMatchMedia = window.matchMedia;

function setReducedMotion(reduced: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: reduced,
    media: q,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('Typewriter', () => {
  afterEach(() => {
    window.matchMedia = realMatchMedia;
  });

  it('shows the full text immediately under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(<Typewriter text="Ada Lovelace" />);
    expect(container.textContent).toContain('Ada Lovelace');
  });

  it('marks the typed content aria-hidden (the real name lives on the parent)', () => {
    setReducedMotion(true);
    const { container } = render(<Typewriter text="Ada Lovelace" />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
