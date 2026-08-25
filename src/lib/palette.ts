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
// Offsets are shifted so the *visible* stops (roughly index 4 upward) straddle
// the accent evenly. A ramp that merely spans the accent renders far ahead of
// it, because the bright high-speed end dominates: an earlier sweep of
// -38°..+62° measured ~+50° off the accent, turning amber into green.
const HUE_OFFSET = [-78, -75, -72, -69, -65, -52, -39, -26, -13, 0, 13, 25];
const SATURATION = [0.5, 0.62, 0.72, 0.8, 0.86, 0.9, 0.92, 0.9, 0.88, 0.84, 0.78, 0.7];
const LIGHTNESS = [0.05, 0.1, 0.17, 0.26, 0.33, 0.39, 0.44, 0.48, 0.52, 0.56, 0.6, 0.64];

/** Number of gradient stops the fluid blends between. */
export const PALETTE_STEPS = HUE_OFFSET.length;

/**
 * Build the fluid's gradient stops from the accent colour. Every stop is
 * individually specified by the three arrays above; only the hue is relative
 * to the accent, so any theme keeps the same shape and shimmer.
 */
export function buildFluidPalette(accent: string): string[] {
  const [hue] = hexToHsl(accent);
  return HUE_OFFSET.map((dh, i) => hslToHex(hue + dh, SATURATION[i], LIGHTNESS[i]));
}
