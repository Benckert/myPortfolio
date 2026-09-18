/** Colour helpers for deriving the WebGL fluid palette from the site's accent
 *  tokens, so `theme <colour>` recolours the background instead of leaving it
 *  stranded on a hardcoded ramp. */

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = Number.parseInt(h, 16);
  return Number.isNaN(n) || h.length !== 6
    ? [0, 0, 0]
    : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

export function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  const seg = Math.floor(hue / 60) % 6;
  const [r, g, b] = (
    [
      [c, x, 0],
      [x, c, 0],
      [0, c, x],
      [0, x, c],
      [x, 0, c],
      [c, 0, x],
    ] as const
  )[seg];
  const to = (v: number) =>
    Math.round(Math.min(255, Math.max(0, (v + m) * 255)))
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/* ── The ramp ────────────────────────────────────────────────────────────────
 * Three parallel arrays, one entry per gradient stop; all three must stay the
 * same length, and that length is simply how many stops the fluid blends
 * between (the stops become a linearly-filtered 1-D texture, so nothing here
 * is magic — add or remove entries freely).
 *
 * Read LiquidEther's colour shader before retuning these:
 *
 *     float lenv = clamp(length(vel), 0.0, 1.0);   // fluid SPEED at this pixel
 *     vec3  c    = texture2D(palette, vec2(lenv, 0.5)).rgb;
 *     outRGB     = mix(bgColor.rgb, c, lenv);
 *     outA       = mix(bgColor.a,   1.0, lenv);
 *
 * The palette is indexed by how fast the fluid is moving — and that same value
 * also drives opacity. So the low indices are doubly faint: they are picked
 * only where the fluid is slow, and there the pixel is nearly transparent
 * anyway. Only the upper part of the ramp is really visible on screen. Spend
 * the early entries on a dark fringe and put the colour you actually want to
 * see from index ~3 upward.
 *
 * Iridescence comes from the hue sweeping while saturation stays high: because
 * a single frame contains a whole range of speeds, a spread-out hue ramp shows
 * several neighbouring hues at once, like an oil slick. HUE_OFFSET entries are
 * degrees relative to the accent, so the shimmer always sits around the theme
 * colour rather than drifting to a fixed hue.
 * ─────────────────────────────────────────────────────────────────────────── */
// Control points, not stops. Offsets are placed so the *visible* upper half
// straddles the accent: a ramp that merely spans the accent renders far ahead
// of it, because the bright high-speed end dominates (an earlier sweep of
// -38°..+62° measured ~+50° off, turning amber into green). The span is wide
// on purpose — that breadth is what reads as iridescence rather than a wash.
const HUE_OFFSET = [-95, -90, -85, -80, -73, -55, -37, -19, -2, 17, 35, 51];
const SATURATION = [0.5, 0.62, 0.72, 0.8, 0.86, 0.92, 0.88, 0.94, 0.86, 0.9, 0.8, 0.72];
const LIGHTNESS = [0.05, 0.1, 0.17, 0.26, 0.32, 0.38, 0.45, 0.49, 0.55, 0.58, 0.62, 0.66];

/**
 * Stops actually handed to the shader. The control points above are resampled
 * up to this many, because the palette becomes a linearly-filtered texture:
 * with one texel per control point, every control point is a kink in the
 * gradient, and those kinks show up on screen as hard seams between colours.
 * Resampling along a smooth curve turns them into continuous transitions.
 */
const STOPS = 64;

/** Number of gradient stops the fluid blends between. */
export const PALETTE_STEPS = STOPS;

/** Catmull-Rom: passes through every control point with a continuous slope,
 *  so the curve neither kinks (linear) nor flattens at each point (smoothstep). */
function spline(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/** Sample a control-point array at t ∈ [0,1] along a smooth curve. */
function sampleCurve(control: number[], t: number): number {
  const x = t * (control.length - 1);
  const i = Math.floor(x);
  const at = (k: number) => control[Math.min(control.length - 1, Math.max(0, k))];
  return spline(at(i - 1), at(i), at(i + 1), at(i + 2), x - i);
}

/**
 * Build the fluid's gradient stops from the accent colour. The three control
 * arrays above define the ramp's shape and are each smoothly resampled to
 * STOPS entries; only the hue is relative to the accent, so any theme keeps
 * the same shape and shimmer.
 */
export function buildFluidPalette(accent: string): string[] {
  const [hue] = hexToHsl(accent);
  return Array.from({ length: STOPS }, (_, i) => {
    const t = i / (STOPS - 1);
    return hslToHex(
      hue + sampleCurve(HUE_OFFSET, t),
      Math.min(1, Math.max(0, sampleCurve(SATURATION, t))),
      Math.min(1, Math.max(0, sampleCurve(LIGHTNESS, t))),
    );
  });
}
