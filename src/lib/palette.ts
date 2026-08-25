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

// Shape of the ramp, tuned by eye: near-black base rising through saturated
// mid-tones. Index i of each array is one gradient stop, so both must stay the
// same length — that length is how many stops the fluid blends between.
const LIGHTNESS = [0.05, 0.13, 0.2, 0.28, 0.35, 0.35, 0.4, 0.42, 0.36];
const SATURATION = [0.5, 0.68, 0.78, 0.78, 0.78, 0.75, 0.7, 0.6, 0.5];

/** How far the ramp's hue travels either side of the accent, in degrees.
 *  Anchoring the span on the accent is what makes the background actually read
 *  as the theme colour: an earlier version interpolated from the accent to a
 *  fixed indigo secondary, and that indigo end dominated the visible output, so
 *  every theme came out blue (measured 219°-252° across all five). Leaning
 *  further forwards than back keeps the default teal drifting into blue, which
 *  is the look the ramp was tuned for. */
const HUE_BACK = -45;
const HUE_FORWARD = 25;

/**
 * Build the fluid's gradient stops from the accent colour. Hue sweeps an
 * analogous span centred slightly ahead of the accent, while lightness and
 * saturation follow the fixed ramp above — so any accent keeps the same depth
 * and only the hue family changes.
 */
export function buildFluidPalette(accent: string): string[] {
  const [hue] = hexToHsl(accent);
  return LIGHTNESS.map((l, i) => {
    const t = i / (LIGHTNESS.length - 1);
    return hslToHex(hue + HUE_BACK + (HUE_FORWARD - HUE_BACK) * t, SATURATION[i], l);
  });
}
