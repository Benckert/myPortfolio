import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BackToTop } from './BackToTop';

describe('BackToTop', () => {
  beforeEach(() => {
    // Mock rAF to run synchronously
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('button is not visible initially (lacks back-to-top--visible class)', () => {
    render(<BackToTop />);
    const btn = screen.getByRole('button', { name: /back to top/i });
    expect(btn).not.toHaveClass('back-to-top--visible');
  });

  it('button becomes visible after scrolling past 400px threshold', () => {
    render(<BackToTop />);
    const btn = screen.getByRole('button', { name: /back to top/i });

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 401, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(btn).toHaveClass('back-to-top--visible');
  });

  it('clicking calls window.scrollTo with top: 0', () => {
    window.scrollTo = vi.fn();
    render(<BackToTop />);
    const btn = screen.getByRole('button', { name: /back to top/i });

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    btn.click();
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0 }),
    );
  });
});
