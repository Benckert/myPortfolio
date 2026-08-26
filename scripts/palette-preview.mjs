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
 * Usage: npx vite-node scripts/palette-preview.mjs [outfile] [--artifact]
 *   --artifact  omit the doctype/meta wrapper, for publishing as an Artifact
 *               (the host supplies the document shell).
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
        <span class="meta">accent ${accent} · hue ${ah.toFixed(0)}°</span></h2>
      <p class="lbl">stops handed to LiquidEther</p>
      <div class="chips">${chips}</div>
      <p class="lbl">as the shader composites it — position is fluid speed, alpha follows speed</p>
      <div class="bar">${bar}</div>
      <div class="axis"><span>slow · transparent</span><span>fast · opaque</span></div>
    </section>`;
  })
  .join('');

/* Committed to the dark ground on purpose: these swatches only mean anything
   judged against the page background they actually composite over, so every
   colour here is painted explicitly rather than inheriting a host theme. Type
   and neutrals come from the site's own tokens. */
const body = `<title>Fluid Palette</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
  :root {
    --bg: ${BG}; --elev: #121826; --fg: #e6edf3; --muted: #93a1b1; --line: #1f2937;
    --sans: 'Inter', system-ui, -apple-system, sans-serif;
    --mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace;
  }
  * { box-sizing: border-box; }
  body { margin:0; padding:40px 32px 64px; background:var(--bg); color:var(--fg);
         font-family:var(--sans); font-size:14px; line-height:1.5; }
  .wrap { max-width:1000px; margin:0 auto; display:flex; flex-direction:column; gap:40px; }
  header { display:flex; flex-direction:column; gap:10px; }
  h1 { font-size:26px; font-weight:600; margin:0; letter-spacing:-0.015em; text-wrap:balance; }
  .note { color:var(--muted); max-width:66ch; margin:0; }
  .note code, .k { font-family:var(--mono); font-size:0.86em; color:var(--fg); }
  section { display:flex; flex-direction:column; gap:8px; }
  h2 { font-size:13px; margin:0; display:flex; align-items:center; gap:10px;
       font-weight:600; letter-spacing:0.08em; text-transform:uppercase; }
  .dot { width:12px; height:12px; border-radius:50%; flex:none; }
  h2 .meta { font-family:var(--mono); font-size:11px; color:var(--muted);
             letter-spacing:0; text-transform:none; font-weight:400; }
  .lbl { color:var(--muted); font-size:12px; margin:10px 0 0; }
  .chips { display:flex; flex-wrap:wrap; gap:6px; }
  .chip { display:flex; flex-direction:column; gap:3px; align-items:center;
          width:78px; font-family:var(--mono); font-size:10px;
          font-variant-numeric:tabular-nums; }
  .sw { width:100%; height:44px; border-radius:5px; border:1px solid var(--line); }
  .dim { color:var(--muted); }
  .bar { display:flex; height:62px; border-radius:6px; overflow:hidden;
         border:1px solid var(--line); }
  .bar i { flex:1; }
  .axis { display:flex; justify-content:space-between; color:var(--muted);
          font-family:var(--mono); font-size:10px; }
</style>
<div class="wrap">
  <header>
    <h1>Fluid Palette</h1>
    <p class="note">${PALETTE_STEPS} stops per theme, generated from each accent by
      <span class="k">buildFluidPalette()</span>. Retune the
      <span class="k">HUE_OFFSET</span> / <span class="k">SATURATION</span> /
      <span class="k">LIGHTNESS</span> arrays in <span class="k">src/lib/palette.ts</span>,
      then re-run the generator.</p>
    <p class="note">The lower bar in each pair is the honest one. LiquidEther indexes this
      palette by fluid speed and reuses that same value as opacity, so the left end is
      barely visible no matter what colour sits there — judge the ramp by its right half.</p>
  </header>
  ${sections}
</div>`;

const artifact = process.argv.includes('--artifact');
const out = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'palette-preview.html';
writeFileSync(out, artifact ? body : `<!doctype html><meta charset="utf-8">\n${body}`);
console.log(`wrote ${out} (${PALETTE_STEPS} stops × ${Object.keys(THEMES).length} themes)`);
