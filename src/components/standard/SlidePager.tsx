import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const Chevron = ({ up }: { up: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d={up ? 'M5 12L10 7L15 12' : 'M5 8L10 13L15 8'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Hover/focus-revealed prev/next slide nav on the right edge. Tracks the active
 *  snap-section with IntersectionObserver and scrolls to its neighbours. */
export function SlidePager() {
  const reduced = usePrefersReducedMotion();
  const [sections, setSections] = useState<HTMLElement[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('main > section'));
    setSections(els);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = els.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { threshold: 0.5 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (idx: number) => {
    sections[idx]?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };

  const hasPrev = active > 0;
  const hasNext = active < sections.length - 1;

  return (
    <div className="slide-pager">
      <button
        type="button"
        className="slide-pager__btn"
        aria-label="Previous section"
        onClick={() => go(active - 1)}
        disabled={!hasPrev}
        hidden={!hasPrev}
      >
        <Chevron up />
      </button>
      <button
        type="button"
        className="slide-pager__btn"
        aria-label="Next section"
        onClick={() => go(active + 1)}
        disabled={!hasNext}
        hidden={!hasNext}
      >
        <Chevron up={false} />
      </button>
    </div>
  );
}
