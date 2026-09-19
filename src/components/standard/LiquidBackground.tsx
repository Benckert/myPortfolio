import { useMemo } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { usePageActive } from '../../hooks/usePageActive';
import { useAccent } from '../../lib/useAccent';
import { buildFluidPalette } from '../../lib/palette';
import { fluid } from '../../config/site';
import { FluidCanvas } from '../effects/FluidCanvas';

/**
 * The animated layer behind every section.
 *
 * Under reduced motion it renders a single still frame rather than nothing, so
 * the page keeps its depth without moving. While the terminal covers the site
 * the canvas is unmounted, since there is no reason to draw what nobody sees.
 *
 * It is NOT unmounted merely because the window lost focus: the shader is
 * stateless and its frame step is clamped, so an unfocused or throttled tab is
 * already harmless, and leaving it mounted means it is simply still there when
 * you look back rather than blinking out and rebuilding.
 *
 * Every value comes from src/config/site.ts — tune it there, not here.
 */
export function LiquidBackground({ paused = false }: { paused?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const active = usePageActive();
  const accent = useAccent();
  const colors = useMemo(() => buildFluidPalette(accent), [accent]);
  if (paused) return null;
  return (
    <div
      className="liquid-bg"
      aria-hidden="true"
      data-testid="liquid-bg"
      style={{ opacity: fluid.opacity }}
    >
      <FluidCanvas
        colors={colors as [string, string, string]}
        renderScale={fluid.renderScale}
        scale={fluid.scale}
        warp={fluid.warp}
        speed={fluid.speed}
        contrast={fluid.contrast}
        pointerRadius={fluid.pointerRadius}
        pointerStrength={fluid.pointerStrength}
        pointerFade={fluid.pointerFade}
        // A still frame for reduced motion, and while the page is in the
        // background there is nothing to animate for.
        still={reduced || !active}
      />
    </div>
  );
}
