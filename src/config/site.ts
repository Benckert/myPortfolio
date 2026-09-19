/* ═════════════════════════════════════════════════════════════════════════════
 * SITE CONFIGURATION — every tunable value in the project, in one place.
 *
 * This is yours to edit. Nothing here needs a component to be touched, and
 * everything is grouped by the part of the site it affects.
 *
 *   1. Fluid background    the animated WebGL layer behind every section
 *   2. Click spark         the burst of lines where you click
 *   3. Portraits           the tilting photo cards in Hero and About
 *   4. Typewriter          the hero name typing itself out
 *   5. Terminal            history and scrollback limits
 *   6. Accent themes       the palette the `theme` command switches between
 *
 * Note on privacy: these are build-time constants compiled into the JavaScript
 * bundle, so a determined visitor can read the values in devtools — as with any
 * front-end code. Nothing here is a secret, and nothing is exposed as a control
 * on the live site; there is no settings panel for visitors.
 *
 * Preview the fluid colours for all five themes without running the site:
 *     npx vite-node scripts/palette-preview.mjs preview.html
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ── 1. Fluid background ────────────────────────────────────────────────────
 *
 * Drawn by our own shader (src/components/effects/), not a library. It is
 * stateless — each frame is computed from time and pointer position alone —
 * which is why it cannot be corrupted by a backgrounded tab or a stalled
 * frame loop the way a fluid simulation is.
 *
 * Colour: the three entries below are blended across the flow, so the
 * background reads as the theme accent with variation rather than one tint.
 * Keep their lightness fairly even; the layer's own `opacity` is what sets how
 * present it is, so dark colours only mute it twice over.
 * ───────────────────────────────────────────────────────────────────────── */

/** One fluid colour, relative to the current theme accent so `theme <colour>`
 *  recolours the background too. */
export interface FluidStop {
  /** Hue offset from the accent, in degrees. Spread these for shimmer; stay
   *  within roughly ±60° or it stops reading as the theme colour. */
  hueOffset: number;
  /** 0–1, higher is more vivid. */
  saturation: number;
  /** 0–1. Keep these close together. */
  lightness: number;
}

export const fluid = {
  /** Opacity of the whole layer. The most direct "more / less present" dial. */
  opacity: 0.5,

  /** Three colours, blended across the flow. */
  stops: [
    { hueOffset: -50, saturation: 0.8, lightness: 0.42 },
    { hueOffset: -18, saturation: 0.72, lightness: 0.54 },
    { hueOffset: 16, saturation: 0.78, lightness: 0.48 },
  ] satisfies FluidStop[],

  /** Render scale, 0.1–1. The main performance dial: the canvas is drawn at
   *  this fraction of its size and stretched up. The flow is soft enough that
   *  0.5 is indistinguishable from 1 while costing a quarter as much. */
  renderScale: 0.5,

  /** Spatial frequency — higher means more, smaller shapes. */
  scale: 1.25,

  /** How hard the flow folds back on itself. Higher is more marbled, lower is
   *  smoother and more cloud-like. */
  warp: 2.3,

  /** Animation rate. */
  speed: 0.5,

  /** How sharply the flow fades into the page background. Higher gives
   *  tighter, more defined shapes with more dark space between them. */
  contrast: 1.7,

  /** Size of the bulge that follows the cursor. */
  pointerRadius: 1.1,

  /** How far the cursor pushes the flow aside. */
  pointerStrength: 0.55,

  /** Seconds for the cursor's influence to fade after it stops moving. */
  pointerFade: 1.5,
} as const;

/* ── 2. Click spark ─────────────────────────────────────────────────────── */

export const clickSpark = {
  /** Length of each spark line, in px. */
  size: 10,
  /** How far the sparks travel from the click, in px. */
  radius: 18,
  /** Number of lines in the burst. */
  count: 10,
  /** Lifetime of a burst, in ms. */
  duration: 500,
  /**
   * Hue offset from the theme accent, in degrees. 180 is the accent's
   * complement, which is what makes the burst read as a contrasting colour
   * against whatever theme is active rather than blending into it.
   */
  hueOffset: 180,
  /** Saturation and lightness of the spark colour, 0–1. Keep the lightness
   *  high so the burst stays visible against the dark page. */
  saturation: 0.9,
  lightness: 0.65,
} as const;

/* ── 3. Portraits ───────────────────────────────────────────────────────── */

export const portraits = {
  hero: {
    /** Square size in px. */
    size: 320,
    /** Hover zoom factor. */
    scaleOnHover: 1.16,
    /** Degrees of tilt at the card's edge. */
    rotateAmplitude: 16,
  },
  about: {
    size: 240,
    scaleOnHover: 1.06,
    rotateAmplitude: 12,
  },
} as const;

/* ── 4. Typewriter ──────────────────────────────────────────────────────── */

export const typewriter = {
  /** Milliseconds per character. */
  speed: 70,
  /** Milliseconds before typing starts. */
  startDelay: 300,
} as const;

/* ── 5. Terminal ────────────────────────────────────────────────────────── */

export const terminal = {
  /** How many past commands ↑/↓ can recall. Persisted for the tab session. */
  historyLimit: 50,
  /** How many output blocks the screen keeps before dropping the oldest. */
  scrollbackLimit: 100,
} as const;

/* ── 6. Accent themes ───────────────────────────────────────────────────── */

/**
 * The palette the terminal's `theme` command switches between. The first entry
 * is the site default. Each recolours buttons, links, section numbers, timeline
 * dots, the fluid background and the click spark.
 */
export const themes: Record<string, string> = {
  teal: '#5eead4',
  amber: '#fbbf24',
  violet: '#a78bfa',
  green: '#4ade80',
  rose: '#fb7185',
};

/** The accent in force before any `theme` command. */
export const defaultAccent = themes.teal;
