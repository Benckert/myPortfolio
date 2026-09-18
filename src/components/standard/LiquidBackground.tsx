import { lazy, Suspense, useMemo } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { useAccent } from '../../lib/useAccent';
import { buildFluidPalette } from '../../lib/palette';
import { fluidConfig } from '../../config/fluid';

const LiquidEther = lazy(() => import('../reactbits/LiquidEther'));

/** One faint, fixed WebGL fluid layer behind every slide. Lazy-loads three.js so
 *  it is code-split out of the main bundle, and renders nothing under reduced motion.
 *  `paused` stops the render loop while an opaque overlay (the terminal) covers it.
 *
 *  Every value here comes from src/config/fluid.ts — tune it there, not here. */
export function LiquidBackground({ paused = false }: { paused?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const accent = useAccent();
  // Memoised on `accent`: LiquidEther rebuilds its WebGL context whenever this
  // array's identity changes, which should happen only on a theme change.
  const colors = useMemo(() => buildFluidPalette(accent), [accent]);
  if (reduced) return null;
  return (
    <div
      className="liquid-bg"
      aria-hidden="true"
      data-testid="liquid-bg"
      style={{ opacity: fluidConfig.opacity }}
    >
      {/* decorative only — if the WebGL chunk fails to load, show nothing */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <LiquidEther
            colors={colors}
            resolution={fluidConfig.resolution}
            maxFps={fluidConfig.maxFps}
            mouseForce={fluidConfig.mouseForce}
            cursorSize={fluidConfig.cursorSize}
            autoSpeed={fluidConfig.autoSpeed}
            autoIntensity={fluidConfig.intensity}
            paused={paused}
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
