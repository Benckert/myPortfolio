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
 * The component (LiquidEther, vendored from react-bits) is stock — everything
 * below is passed to it as ordinary props. Two behaviours are worth knowing
 * before tuning:
 *
 * The shader uses fluid SPEED as both the colour index and the opacity, so slow
 * fluid is transparent and the dark page shows through. Darkness comes from
 * opacity, not from the colours — which is why every colour below is
 * mid-to-light. Adding dark ones double-counts the fade and creates visible
 * seams.
 *
 * The pointer stops being followed within a band at each edge, of width
 * (cursorSize + 2) / (2 × resolution) pixels — about 42px as configured. That
 * is the component's own clamp, so the only ways to shrink it are a smaller
 * `cursorSize` or a higher `resolution`.
 * ───────────────────────────────────────────────────────────────────────── */

/** One fluid colour, relative to the current theme accent so `theme <colour>`
 *  recolours the background too. */
export interface FluidStop {
  /** Hue offset from the accent, in degrees. Spread these for shimmer; stay
   *  within roughly ±60° or it stops reading as the theme colour. The last
   *  entry dominates, so the set should sit behind the accent, not ahead. */
  hueOffset: number;
  /** 0–1, higher is more vivid. */
  saturation: number;
  /** 0–1. Keep these close together — even lightness is what stops the
   *  shader's speed clamp showing as a hard edge. */
  lightness: number;
}

export const fluid = {
  /** Opacity of the whole layer. The most direct "more / less present" dial. */
  opacity: 0.45,

  /** Colours, blended from slow fluid to fast. Three is what the component is
   *  designed around; more simply gives a longer gradient. */
  stops: [
    { hueOffset: -55, saturation: 0.85, lightness: 0.44 },
    { hueOffset: -25, saturation: 0.75, lightness: 0.56 },
    { hueOffset: 10, saturation: 0.8, lightness: 0.5 },
  ] satisfies FluidStop[],

  /** Simulation grid scale, 0.1–0.5. The main performance lever: lower is
   *  cheaper but coarser, and widens the edge band described above. */
  resolution: 0.5,

  /** Radius of the cursor's influence, in simulation cells. Also sets the
   *  edge band — halving this halves the band. */
  cursorSize: 40,

  /** How hard the cursor pushes. Lower is calmer; very high values make fast
   *  swipes saturate into a flat slab of the last colour. */
  mouseForce: 16,

  /** Speed of the automatic "ghost cursor" that animates the page when nobody
   *  is interacting with it. */
  autoSpeed: 0.4,

  /** Multiplies the ghost cursor's velocity. Doubles as a vividness dial,
   *  because it decides how far up the colour list the fluid reaches. */
  intensity: 2.0,

  /** Milliseconds of no pointer input before the ghost cursor takes over. */
  autoResumeDelay: 1000,
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
