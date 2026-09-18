/* ─────────────────────────────────────────────────────────────────────────────
 * Fluid background — every knob, in one place.
 *
 * This is the WebGL layer behind the whole site (LiquidEther, rendered by
 * `src/components/standard/LiquidBackground.tsx`). Edit the values here; you
 * should not need to touch the component.
 *
 * Preview the colours for all five themes without running the site:
 *     npx vite-node scripts/palette-preview.mjs preview.html
 *
 * Two things are worth knowing before you tune anything:
 *
 * 1. The shader uses fluid SPEED as both the colour index and the opacity:
 *
 *        lenv   = clamp(length(velocity), 0.0, 1.0)
 *        outRGB = mix(transparent, colour[lenv], lenv)
 *
 *    So slow fluid is transparent and the dark page shows through — darkness
 *    comes from opacity, not from the colours. That is why every colour below
 *    is mid-to-light: adding dark colours double-counts the fade and creates
 *    visible seams where fast regions hit the clamp.
 *
 * 2. `intensity` decides how far up the colour list the fluid actually
 *    reaches, so it behaves as much like a saturation dial as a motion one.
 *    Turning it down mutes the colour as well as the movement.
 * ───────────────────────────────────────────────────────────────────────── */

/** One colour of the fluid, expressed relative to the current theme accent so
 *  that `theme <colour>` recolours the background too. */
export interface FluidStop {
  /** Hue offset from the accent, in degrees. Spread these apart for shimmer;
   *  keep them within roughly ±60° or the background stops reading as the
   *  theme colour. The last entry dominates what you see, so the set should
   *  sit *behind* the accent rather than ahead of it. */
  hueOffset: number;
  /** 0–1. Higher is more vivid. */
  saturation: number;
  /** 0–1. Keep these close together — an even lightness across the set is
   *  what stops the shader's speed clamp showing up as a hard edge. */
  lightness: number;
}

export const fluidConfig = {
  /** Opacity of the whole layer. The most direct "more / less present" dial. */
  opacity: 0.45,

  /**
   * Colours, blended in order from slow fluid to fast. Three is what
   * LiquidEther is designed around (its own demo exposes exactly three
   * pickers); more is allowed and simply gives a longer gradient.
   */
  stops: [
    { hueOffset: -55, saturation: 0.85, lightness: 0.44 },
    { hueOffset: -25, saturation: 0.75, lightness: 0.56 },
    { hueOffset: 10, saturation: 0.8, lightness: 0.5 },
  ] satisfies FluidStop[],

  /**
   * Simulation grid scale, 0.1–0.5. The biggest performance lever there is:
   * dropping 0.4 → 0.22 roughly doubled the frame rate in testing. Low values
   * are cheaper but coarser, which can look steppy in the gradients.
   */
  resolution: 0.3,

  /**
   * Cap the simulation's frame rate. 0 follows the display (smoothest).
   * Setting e.g. 30 halves the GPU cost but makes the motion visibly steppier.
   */
  maxFps: 0,

  /** How hard the cursor pushes the fluid. Lower is calmer; very high values
   *  make fast swipes saturate into a flat slab of the last colour. */
  mouseForce: 14,

  /** Radius of the cursor's influence, in simulation units. */
  cursorSize: 100,

  /** Speed of the automatic "ghost cursor" that animates the fluid when nobody
   *  is interacting with the page. */
  autoSpeed: 0.4,

  /** Multiplies the ghost cursor's velocity. Doubles as a vividness dial —
   *  see note 2 at the top of this file. */
  intensity: 2.0,
} as const;
