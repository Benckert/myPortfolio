import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiquidBackground } from './LiquidBackground';

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

describe('LiquidBackground', () => {
  afterEach(() => {
    window.matchMedia = realMatchMedia;
  });

  it('renders a fixed background container when motion is allowed', () => {
    setReducedMotion(false);
    render(<LiquidBackground />);
    expect(screen.getByTestId('liquid-bg')).toBeInTheDocument();
  });

  it('renders nothing under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(<LiquidBackground />);
    expect(screen.queryByTestId('liquid-bg')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
