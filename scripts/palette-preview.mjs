/**
 * Renders the fluid palette for every theme to a standalone HTML page, so the
 * ramp can be judged by eye and by number instead of by squinting at the site.
 *
 * Each theme shows two rows:
 *   "stops"   — the raw colours handed to LiquidEther, one chip per entry.
 *   "on screen" — the same ramp as the shader actually composites it: position
 *                 is fluid speed, and because speed drives opacity too, every
 *                 sample is drawn at alpha = speed over the page background.
 *                 This row is what you really see; the left of it is near-
 *                 invisible by design.
 *
 * Usage: node scripts/palette-preview.mjs [outfile]
 */
import { writeFileSync } from 'node:fs';
import { buildFluidPalette, hexToHsl, PALETTE_STEPS } from '../src/lib/palette.ts';

const BG = '#0b0f17';
const THEMES = {
  teal: '#5eead4',
  amber: '#fbbf24',
  violet: '#a78bfa',
  green: '#4ade80',
  rose: '#fb7185',
};

const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Composite `hex` over the page background at the given alpha. */
function over(hex, alpha) {
  const [r, g, b] = hex2rgb(hex);
  const [br, bg_, bb] = hex2rgb(BG);
  const mix = (c, bc) => Math.round(bc + (c - bc) * alpha);
  return `rgb(${mix(r, br)}, ${mix(g, bg_)}, ${mix(b, bb)})`;
}

const sections = Object.entries(THEMES)
  .map(([name, accent]) => {
    const stops = buildFluidPalette(accent);
    const [ah] = hexToHsl(accent);

    const chips = stops
      .map((hex, i) => {
        const [h, s, l] = hexToHsl(hex);
        return `<div class="chip">
          <div class="sw" style="background:${hex}"></div>
          <code>${i}</code><code>${hex}</code>
          <code class="dim">H${h.toFixed(0)} S${(s * 100).toFixed(0)} L${(l * 100).toFixed(0)}</code>
        </div>`;
      })
      .join('');

    // 60 samples across speed 0..1, each drawn at alpha = speed
    const bar = Array.from({ length: 60 }, (_, i) => {
      const t = i / 59;
      const idx = t * (stops.length - 1);
      const a = stops[Math.floor(idx)];
      const b = stops[Math.min(stops.length - 1, Math.ceil(idx))];
      const f = idx - Math.floor(idx);
      const lerp = (x, y) => Math.round(x + (y - x) * f);
      const [ar, ag, ab] = hex2rgb(a);
      const [br2, bg2, bb2] = hex2rgb(b);
      const mixHex =
        '#' +
        [lerp(ar, br2), lerp(ag, bg2), lerp(ab, bb2)]
          .map((v) => v.toString(16).padStart(2, '0'))
          .join('');
      return `<i style="background:${over(mixHex, t)}"></i>`;
    }).join('');

    return `<section>
      <h2><span class="dot" style="background:${accent}"></span>${name}
        <code class="dim">accent ${accent} · hue ${ah.toFixed(0)}°</code></h2>
      <p class="lbl">stops handed to LiquidEther</p>
      <div class="chips">${chips}</div>
      <p class="lbl">on screen — position is fluid speed, alpha follows speed</p>
      <div class="bar">${bar}</div>
      <div class="axis"><span>slow / transparent</span><span>fast / opaque</span></div>
    </section>`;
  })
  .join('');

const html = `<!doctype html><meta charset="utf-8">
<title>Fluid palette preview</title>
<style>
  body { margin:0; padding:32px; background:${BG}; color:#e6edf3;
         font:14px/1.5 ui-sans-serif, system-ui, sans-serif; }
  h1 { font-size:20px; margin:0 0 4px; }
  .note { color:#93a1b1; max-width:70ch; margin:0 0 28px; }
  section { margin:0 0 34px; }
  h2 { font-size:15px; margin:0 0 10px; display:flex; align-items:center; gap:10px;
       text-transform:capitalize; font-weight:600; }
  .dot { width:14px; height:14px; border-radius:50%; display:inline-block; }
  .lbl { color:#93a1b1; font-size:12px; margin:12px 0 6px; }
  .chips { display:flex; flex-wrap:wrap; gap:6px; }
  .chip { display:flex; flex-direction:column; gap:2px; align-items:center; width:86px; }
  .sw { width:100%; height:46px; border-radius:6px; border:1px solid #1f2937; }
  code { font:11px ui-monospace, monospace; }
  .dim { color:#93a1b1; }
  .bar { display:flex; height:64px; border-radius:8px; overflow:hidden; border:1px solid #1f2937; }
  .bar i { flex:1; }
  .axis { display:flex; justify-content:space-between; color:#93a1b1; font-size:11px; margin-top:4px; }
</style>
<h1>Fluid palette — ${PALETTE_STEPS} stops per theme</h1>
<p class="note">Edit <code>HUE_OFFSET</code> / <code>SATURATION</code> / <code>LIGHTNESS</code> in
<code>src/lib/palette.ts</code> and re-run <code>node scripts/palette-preview.mjs</code>.
The lower “on screen” bar is the honest one: LiquidEther indexes the palette by fluid
speed and uses that same value as opacity, so the left third is barely visible no
matter what colour you put there.</p>
${sections}`;

const out = process.argv[2] ?? 'palette-preview.html';
writeFileSync(out, html);
console.log(`wrote ${out} (${PALETTE_STEPS} stops × ${Object.keys(THEMES).length} themes)`);
