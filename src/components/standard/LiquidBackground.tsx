import { lazy, Suspense, useMemo } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cssVar } from '../../lib/cssVar';

const LiquidEther = lazy(() => import('../reactbits/LiquidEther'));

/** One faint, fixed WebGL fluid layer behind every slide. Lazy-loads three.js so
 *  it is code-split out of the main bundle, and renders nothing under reduced motion.
 *  `paused` stops the render loop while an opaque overlay (the terminal) covers it. */
export function LiquidBackground({ paused = false }: { paused?: boolean }) {
  const reduced = usePrefersReducedMotion();
  // Token-driven palette (dark base has no site token — shader tint only).
  // Memoised so the array identity is stable: LiquidEther rebuilds its WebGL
  // context whenever `colors` changes identity.
  const colors = useMemo(
    () => ['#0b2e2a', cssVar('--accent', '#5eead4'), cssVar('--accent-2', '#818cf8')],
    [],
  );
  if (reduced) return null;
  return (
    <div className="liquid-bg" aria-hidden="true" data-testid="liquid-bg">
      <Suspense fallback={null}>
        <LiquidEther
          colors={colors}
          resolution={0.4}
          autoIntensity={1.6}
          autoSpeed={0.4}
          paused={paused}
          style={{ width: '100%', height: '100%' }}
        />
      </Suspense>
    </div>
  );
}
