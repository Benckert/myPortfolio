import { lazy, Suspense, useMemo } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { usePageActive } from '../../hooks/usePageActive';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { useAccent } from '../../lib/useAccent';
import { buildFluidPalette } from '../../lib/palette';
import { fluid } from '../../config/site';

const LiquidEther = lazy(() => import('../reactbits/LiquidEther'));

/**
 * One faint, fixed WebGL fluid layer behind every slide. Lazy-loads three.js so
 * it is code-split out of the main bundle, and renders nothing under reduced
 * motion.
 *
 * The component is stock react-bits, so it has no pause control: instead it is
 * unmounted whenever it should not be running — while the terminal covers it,
 * and whenever the page is hidden or the window loses focus. Unmounting
 * disposes the WebGL context outright, so nothing is simulated in the
 * background, and remounting starts the fluid from rest. That is deliberate:
 * dissipation happens per frame rather than per second, so a simulation left
 * running (or throttled) while nobody is watching comes back as energetic as it
 * was minutes ago.
 *
 * Every value comes from src/config/site.ts — tune it there, not here.
 */
export function LiquidBackground({ paused = false }: { paused?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const pageActive = usePageActive();
  const accent = useAccent();
  // Memoised on `accent` so the WebGL context is rebuilt only on a theme change.
  const colors = useMemo(() => buildFluidPalette(accent), [accent]);
  if (reduced) return null;
  return (
    <div
      className="liquid-bg"
      aria-hidden="true"
      data-testid="liquid-bg"
      style={{ opacity: fluid.opacity }}
    >
      {/* decorative only — if the WebGL chunk fails to load, show nothing */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          {!paused && pageActive && (
            <LiquidEther
              colors={colors}
              resolution={fluid.resolution}
              cursorSize={fluid.cursorSize}
              mouseForce={fluid.mouseForce}
              autoSpeed={fluid.autoSpeed}
              autoIntensity={fluid.intensity}
              autoResumeDelay={fluid.autoResumeDelay}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
