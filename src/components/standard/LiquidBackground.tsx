import { lazy, Suspense, useMemo } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { ErrorBoundary } from '../shared/ErrorBoundary';

const LiquidEther = lazy(() => import('../reactbits/LiquidEther'));

/** Palette for the fluid. The stops become a gradient texture, so more of them
 *  means smoother blending rather than a few hard-edged hues. These are
 *  deliberately deeper and less saturated than the site's brand tokens: at this
 *  opacity the bright teal read as a flat wash, while jewel tones keep depth.
 *  Runs near-black → deep teal → petrol → indigo → violet. */
const PALETTE = [
  '#04080f',
  '#06202b',
  '#083f43',
  '#0b5a52',
  '#0e6f63',
  '#12557f',
  '#1a3a86',
  '#2c2f77',
  '#3a2a63',
];

/** One faint, fixed WebGL fluid layer behind every slide. Lazy-loads three.js so
 *  it is code-split out of the main bundle, and renders nothing under reduced motion.
 *  `paused` stops the render loop while an opaque overlay (the terminal) covers it. */
export function LiquidBackground({ paused = false }: { paused?: boolean }) {
  const reduced = usePrefersReducedMotion();
  // Memoised so the array identity is stable: LiquidEther rebuilds its WebGL
  // context whenever `colors` changes identity.
  const colors = useMemo(() => PALETTE, []);
  if (reduced) return null;
  return (
    <div className="liquid-bg" aria-hidden="true" data-testid="liquid-bg">
      {/* decorative only — if the WebGL chunk fails to load, show nothing */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <LiquidEther
            colors={colors}
            // Simulation grid scale — the biggest performance lever on the site
            // (0.4 → 0.22 roughly doubled frame rate in testing). Raise for
            // crisper detail, lower if the background still costs too much.
            resolution={0.22}
            autoIntensity={1.4}
            autoSpeed={0.4}
            paused={paused}
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
