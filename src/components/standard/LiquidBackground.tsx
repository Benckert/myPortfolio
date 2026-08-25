import { lazy, Suspense, useMemo } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { useAccent } from '../../lib/useAccent';
import { buildFluidPalette } from '../../lib/palette';

const LiquidEther = lazy(() => import('../reactbits/LiquidEther'));

/** One faint, fixed WebGL fluid layer behind every slide. Lazy-loads three.js so
 *  it is code-split out of the main bundle, and renders nothing under reduced motion.
 *  `paused` stops the render loop while an opaque overlay (the terminal) covers it. */
export function LiquidBackground({ paused = false }: { paused?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const accent = useAccent();
  // Nine stops derived from the accent, so `theme <colour>` recolours the
  // background too. Memoised on `accent`: LiquidEther rebuilds its WebGL
  // context whenever this array's identity changes, which should happen only
  // when the theme actually changes, not on every render.
  const colors = useMemo(() => buildFluidPalette(accent), [accent]);
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
            autoIntensity={2.0}
            autoSpeed={0.4}
            paused={paused}
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
