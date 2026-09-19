/** Colour helpers for deriving the WebGL fluid palette from the site's accent
 *  tokens, so `theme <colour>` recolours the background instead of leaving it
 *  stranded on a hardcoded ramp. Tune the colours in src/config/fluid.ts. */
import { fluid, clickSpark } from '../config/site';

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

/* ── The palette ─────────────────────────────────────────────────────────────
 * The colours themselves live in src/config/fluid.ts; this module only turns
 * them into hex for the accent in play. See that file for why they are all
 * mid-to-light and why the set sits behind the accent.
 * ─────────────────────────────────────────────────────────────────────────── */

/** Number of colours handed to the fluid. */
export const PALETTE_STEPS = fluid.stops.length;

/** Build the fluid's colours from the accent: an analogous spread at roughly
 *  even lightness, so the effect reads as the theme colour with depth. */
export function buildFluidPalette(accent: string): string[] {
  const [hue] = hexToHsl(accent);
  return fluid.stops.map(({ hueOffset, saturation, lightness }) =>
    hslToHex(hue + hueOffset, saturation, lightness),
  );
}

/** A colour that stands against the accent rather than blending into it —
 *  used for the click spark, so the burst reads clearly in every theme. */
export function buildSparkColor(accent: string): string {
  const [hue] = hexToHsl(accent);
  return hslToHex(hue + clickSpark.hueOffset, clickSpark.saturation, clickSpark.lightness);
}
