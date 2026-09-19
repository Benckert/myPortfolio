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

  // Changed deliberately: the old effect was removed entirely under reduced
  // motion because it could only animate. The shader that replaced it can draw
  // a single frame and hold it, so reduced-motion users keep the page's depth
  // while getting no movement at all — which is what the preference asks for.
  it('still renders under reduced motion, held on one frame', () => {
    setReducedMotion(true);
    render(<LiquidBackground />);
    expect(screen.getByTestId('liquid-bg')).toBeInTheDocument();
  });

  it('renders nothing while the terminal covers the site', () => {
    setReducedMotion(false);
    const { container } = render(<LiquidBackground paused />);
    expect(screen.queryByTestId('liquid-bg')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
