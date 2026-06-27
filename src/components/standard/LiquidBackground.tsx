import { lazy, Suspense } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const LiquidEther = lazy(() => import('../reactbits/LiquidEther'));

/** One faint, fixed WebGL fluid layer behind every slide. Lazy-loads three.js so
 *  it is code-split out of the main bundle, and renders nothing under reduced motion. */
export function LiquidBackground() {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;
  return (
    <div className="liquid-bg" aria-hidden="true" data-testid="liquid-bg">
      <Suspense fallback={null}>
        <LiquidEther
          colors={['#0b2e2a', '#5eead4', '#818cf8']}
          resolution={0.4}
          autoIntensity={1.6}
          autoSpeed={0.4}
          style={{ width: '100%', height: '100%' }}
        />
      </Suspense>
    </div>
  );
}
