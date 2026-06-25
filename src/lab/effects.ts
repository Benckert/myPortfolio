// Catalog of interaction specimens. Pure data — Lab.tsx renders each `kind`.
// `cls` is the modifier applied to the demo base; `style` sets per-variant vars;
// `data` becomes data-* attributes wired up by behaviors.ts (JS-driven effects).

export type Kind =
  | 'button' | 'portrait' | 'chip' | 'card' | 'link' | 'heading' | 'bg' | 'loader' | 'glass';

export type Source = 'bespoke' | 'reactbits' | 'shadcn';

export interface Variant {
  code: string;            // specimen code, e.g. "BTN·07"
  name: string;
  blurb: string;
  source: Source;                  // where this specimen comes from
  component?: string;              // registry key (required when source !== 'bespoke')
  install?: string;               // exact command to ship it
  props?: Record<string, unknown>; // props passed to the library component
  siteTarget?: string;            // where this would live on the real site
  cls?: string;
  style?: Record<string, string>;
  data?: Record<string, string>; // bespoke: data-* hooks for behaviors.ts
  label?: string;          // text content for text-bearing demos
  current?: boolean;       // marks what's live on the site today
  js?: boolean;            // needs JS (shows a JS badge)
  live?: boolean;          // animates at rest (shows a LIVE badge)
}

export interface Category {
  id: string;
  code: string;
  title: string;
  desc: string;
  kind: Kind;
  variants: Variant[];
}

const c = (n: number, p: string) => `${p}·${String(n).padStart(2, '0')}`;

export const categories: Category[] = [
  {
    id: 'buttons', code: 'A', title: 'CTA buttons', kind: 'button',
    desc: 'Primary call-to-action treatments. Hover to feel each; the glares can be fired in sync from the rail.',
    variants: [
      { code: c(1, 'BTN'), name: 'Glare 0.55s', blurb: 'Current sweep — you found it too fast.', source: 'bespoke', cls: 'glare', style: { '--glare': '0.55s' }, current: true },
      { code: c(2, 'BTN'), name: 'Glare 0.85s', blurb: 'A touch slower, still responsive.', source: 'bespoke', cls: 'glare', style: { '--glare': '0.85s' } },
      { code: c(3, 'BTN'), name: 'Glare 1.10s', blurb: 'Relaxed, more premium pace.', source: 'bespoke', cls: 'glare', style: { '--glare': '1.1s' } },
      { code: c(4, 'BTN'), name: 'Glare ease-out', blurb: 'Fast in, soft landing.', source: 'bespoke', cls: 'glare', style: { '--glare': '0.9s', '--glare-ease': 'cubic-bezier(.22,.61,.36,1)' } },
      { code: c(5, 'BTN'), name: 'Glare bright', blurb: 'Stronger, glossier shine.', source: 'bespoke', cls: 'glare bt-bright', style: { '--glare': '0.9s' } },
      { code: c(6, 'BTN'), name: 'Glare wide-soft', blurb: 'Broad, gentle sheen.', source: 'bespoke', cls: 'glare bt-wide', style: { '--glare': '0.9s' } },
      { code: c(7, 'BTN'), name: 'Glow', blurb: 'Teal halo blooms + lift.', source: 'bespoke', cls: 'bt-glow' },
      { code: c(8, 'BTN'), name: 'Gradient slide', blurb: 'Hue travels across the fill.', source: 'bespoke', cls: 'bt-grad' },
      { code: c(9, 'BTN'), name: 'Gradient border', blurb: 'Rotating conic outline.', source: 'bespoke', cls: 'bt-gborder', live: true },
      { code: c(10, 'BTN'), name: 'Ring expand', blurb: 'Soft outline rings out.', source: 'bespoke', cls: 'bt-ring' },
      { code: c(11, 'BTN'), name: 'Press depth', blurb: 'Tactile inset on press.', source: 'bespoke', cls: 'bt-press' },
      { code: c(12, 'BTN'), name: 'Fill from center', blurb: 'Accent grows from the middle.', source: 'bespoke', cls: 'bt-fill', label: 'Get in touch' },
      { code: c(13, 'BTN'), name: 'Arrow slide', blurb: 'Arrow eases in on hover.', source: 'bespoke', cls: 'bt-arrow', label: 'View work' },
      { code: c(14, 'BTN'), name: 'Shimmer label', blurb: 'Light sweeps the text.', source: 'bespoke', cls: 'bt-shimmer', label: 'Download CV', live: true },
      { code: c(15, 'BTN'), name: 'Neon pulse', blurb: 'Glow breathes while hovered.', source: 'bespoke', cls: 'bt-neon', label: 'Enter terminal' },
      { code: c(16, 'BTN'), name: 'Shadow lift', blurb: 'Big soft float upward.', source: 'bespoke', cls: 'bt-lift' },
      { code: c(17, 'BTN'), name: 'Magnetic', blurb: 'Button leans toward the cursor.', source: 'bespoke', cls: 'bt-glow', data: { magnetic: '0.3' }, js: true },
      { code: c(18, 'BTN'), name: '3D tilt', blurb: 'Surface tips under the cursor.', source: 'bespoke', data: { tilt: '10' }, js: true },
      { code: c(19, 'BTN'), name: 'Ripple', blurb: 'Ink ripples from the click point.', source: 'bespoke', data: { ripple: '' }, js: true, label: 'Click me' },
    ],
  },
  {
    id: 'portraits', code: 'B', title: 'Portrait / image', kind: 'portrait',
    desc: 'Treatments for the avatar on hover. Current is a thin, faint teal ring.',
    variants: [
      { code: c(1, 'POR'), name: 'Ring 4px', blurb: '0.18α — the live ring.', source: 'bespoke', cls: 'po-r4', current: true },
      { code: c(2, 'POR'), name: 'Ring 6px', blurb: '0.25α — bolder.', source: 'bespoke', cls: 'po-r6' },
      { code: c(3, 'POR'), name: 'Ring 8px', blurb: '0.30α — prominent.', source: 'bespoke', cls: 'po-r8' },
      { code: c(4, 'POR'), name: 'Halo', blurb: '10px ring + 3px border.', source: 'bespoke', cls: 'po-halo' },
      { code: c(5, 'POR'), name: 'Pulse', blurb: 'Ring ripples outward.', source: 'bespoke', cls: 'po-pulse' },
      { code: c(6, 'POR'), name: 'Conic spin', blurb: 'Rotating gradient ring.', source: 'bespoke', cls: 'po-conic' },
      { code: c(7, 'POR'), name: 'Shine sweep', blurb: 'Light sweeps the photo.', source: 'bespoke', cls: 'po-shine' },
      { code: c(8, 'POR'), name: 'Brighten', blurb: 'Scale + glow, no ring.', source: 'bespoke', cls: 'po-bright' },
      { code: c(9, 'POR'), name: 'Gray → colour', blurb: 'Desaturated until hovered.', source: 'bespoke', cls: 'po-gray' },
      { code: c(10, 'POR'), name: 'Duotone', blurb: 'Stylised teal tint on hover.', source: 'bespoke', cls: 'po-duo' },
      { code: c(11, 'POR'), name: 'Blur → focus', blurb: 'Sharpens on hover.', source: 'bespoke', cls: 'po-blur' },
      { code: c(12, 'POR'), name: 'Squircle morph', blurb: 'Circle relaxes to a squircle.', source: 'bespoke', cls: 'po-squircle' },
      { code: c(13, 'POR'), name: 'Zoom', blurb: 'Image pushes in within frame.', source: 'bespoke', cls: 'po-zoom' },
      { code: c(14, 'POR'), name: 'Spotlight', blurb: 'Light tracks the cursor.', source: 'bespoke', cls: 'po-spot', data: { spotlight: '' }, js: true },
      { code: c(15, 'POR'), name: '3D tilt', blurb: 'Frame tips toward cursor.', source: 'bespoke', cls: 'po-tilt', data: { tilt: '14' }, js: true },
    ],
  },
  {
    id: 'chips', code: 'C', title: 'Skill chips', kind: 'chip',
    desc: 'Non-clickable tags. Live hover is a subtle colour swap; these add size or motion.',
    variants: [
      { code: c(1, 'CHP'), name: 'Colour only', blurb: 'Border colour swap — current.', source: 'bespoke', cls: 'ch-color', current: true },
      { code: c(2, 'CHP'), name: '+3px ring', blurb: 'Subtle glow ring.', source: 'bespoke', cls: 'ch-ring3' },
      { code: c(3, 'CHP'), name: '+5px ring', blurb: 'Softer, bigger glow.', source: 'bespoke', cls: 'ch-ring5' },
      { code: c(4, 'CHP'), name: 'Fill sweep', blurb: 'Tint slides in from left.', source: 'bespoke', cls: 'ch-fill' },
      { code: c(5, 'CHP'), name: 'Accent bar', blurb: 'Left edge thickens.', source: 'bespoke', cls: 'ch-bar' },
      { code: c(6, 'CHP'), name: 'Big lift', blurb: 'Stronger float + shadow.', source: 'bespoke', cls: 'ch-lift' },
      { code: c(7, 'CHP'), name: 'Gradient border', blurb: 'Conic outline on hover.', source: 'bespoke', cls: 'ch-gborder' },
      { code: c(8, 'CHP'), name: 'Glow pulse', blurb: 'Ring breathes while hovered.', source: 'bespoke', cls: 'ch-glow' },
      { code: c(9, 'CHP'), name: 'Gradient text', blurb: 'Label picks up the accent.', source: 'bespoke', cls: 'ch-grad' },
      { code: c(10, 'CHP'), name: 'Bounce', blurb: 'Playful hop on hover.', source: 'bespoke', cls: 'ch-bounce' },
      { code: c(11, 'CHP'), name: 'Dot reveal', blurb: 'Status dot grows in.', source: 'bespoke', cls: 'ch-dot' },
    ],
  },
  {
    id: 'cards', code: 'D', title: 'Project cards', kind: 'card',
    desc: 'Surfaces for project tiles. Today the card just swaps its border colour on hover.',
    variants: [
      { code: c(1, 'CRD'), name: 'Shadow lift', blurb: 'Floats up with soft shadow.', source: 'bespoke', cls: 'cd-lift' },
      { code: c(2, 'CRD'), name: 'Border glow', blurb: 'Accent outline + bloom.', source: 'bespoke', cls: 'cd-glow' },
      { code: c(3, 'CRD'), name: 'Top accent', blurb: 'Accent line draws across top.', source: 'bespoke', cls: 'cd-top' },
      { code: c(4, 'CRD'), name: 'Thumb zoom', blurb: 'Cover scales on hover.', source: 'bespoke', cls: 'cd-zoom' },
      { code: c(5, 'CRD'), name: 'Spotlight', blurb: 'Glow follows the cursor.', source: 'bespoke', cls: 'cd-spot', data: { spotlight: '' }, js: true },
      { code: c(6, 'CRD'), name: '3D tilt', blurb: 'Card tips under the cursor.', source: 'bespoke', cls: 'cd-tilt', data: { tilt: '8' }, js: true },
      { code: c(7, 'CRD'), name: 'Gradient border', blurb: 'Rotating conic frame.', source: 'bespoke', cls: 'cd-gborder' },
      { code: c(8, 'CRD'), name: 'Reveal CTA', blurb: 'Call-to-action slides up.', source: 'bespoke', cls: 'cd-reveal' },
    ],
  },
  {
    id: 'links', code: 'E', title: 'Links & nav', kind: 'link',
    desc: 'Inline and nav links — underline and reveal behaviours.',
    variants: [
      { code: c(1, 'LNK'), name: 'Underline slide', blurb: 'Wipes in, out the other side.', source: 'bespoke', cls: 'ln-slide', label: 'Read more' },
      { code: c(2, 'LNK'), name: 'Underline center', blurb: 'Grows from the middle.', source: 'bespoke', cls: 'ln-center', label: 'Read more' },
      { code: c(3, 'LNK'), name: 'Underline draw', blurb: 'Draws left to right.', source: 'bespoke', cls: 'ln-draw', label: 'Read more' },
      { code: c(4, 'LNK'), name: 'Double rule', blurb: 'Two-tone underline grows.', source: 'bespoke', cls: 'ln-double', label: 'Read more' },
      { code: c(5, 'LNK'), name: 'Pill fill', blurb: 'Background pill fills in.', source: 'bespoke', cls: 'ln-pill', label: 'Contact' },
      { code: c(6, 'LNK'), name: 'Brackets', blurb: 'Mono brackets snap in.', source: 'bespoke', cls: 'ln-bracket', label: 'about' },
      { code: c(7, 'LNK'), name: 'Colour fade', blurb: 'Eases to the accent.', source: 'bespoke', cls: 'ln-fade', label: 'Read more' },
      { code: c(8, 'LNK'), name: 'Arrow trail', blurb: 'Arrow slides in after text.', source: 'bespoke', cls: 'ln-arrow', label: 'Projects' },
    ],
  },
  {
    id: 'headings', code: 'F', title: 'Headings & text', kind: 'heading',
    desc: 'Display-text treatments. Several animate at rest; two are JS-driven.',
    variants: [
      { code: c(1, 'TXT'), name: 'Gradient', blurb: 'Accent gradient drifts.', source: 'bespoke', cls: 'hd-grad', label: 'Kristoffer', live: true },
      { code: c(2, 'TXT'), name: 'Shimmer', blurb: 'Highlight sweeps across.', source: 'bespoke', cls: 'hd-shimmer', label: 'Kristoffer', live: true },
      { code: c(3, 'TXT'), name: 'Glitch', blurb: 'RGB split flicker.', source: 'bespoke', cls: 'hd-glitch', label: 'Kristoffer', live: true },
      { code: c(4, 'TXT'), name: 'Accent rule', blurb: 'Short underline mark.', source: 'bespoke', cls: 'hd-underline', label: 'Kristoffer' },
      { code: c(5, 'TXT'), name: 'Typed caret', blurb: 'Blinking terminal caret.', source: 'bespoke', cls: 'hd-caret', label: 'Kristoffer', live: true },
      { code: c(6, 'TXT'), name: 'Char stagger', blurb: 'Letters rise in on load/hover.', source: 'bespoke', cls: 'hd-stagger', data: { stagger: '' }, label: 'Kristoffer', js: true },
      { code: c(7, 'TXT'), name: 'Scramble', blurb: 'Decrypts to the word on hover.', source: 'bespoke', cls: 'hd-scramble', data: { scramble: '' }, label: 'Kristoffer', js: true },
    ],
  },
  {
    id: 'backgrounds', code: 'G', title: 'Ambient backgrounds', kind: 'bg',
    desc: 'Section / hero atmospheres. Most loop at rest; spotlight tracks the cursor.',
    variants: [
      { code: c(1, 'BG'), name: 'Aurora', blurb: 'Drifting colour clouds (site hero).', source: 'bespoke', cls: 'bg-aurora', live: true },
      { code: c(2, 'BG'), name: 'Animated gradient', blurb: 'Slow hue cycle.', source: 'bespoke', cls: 'bg-gradient', live: true },
      { code: c(3, 'BG'), name: 'Grid', blurb: 'Blueprint lines.', source: 'bespoke', cls: 'bg-grid' },
      { code: c(4, 'BG'), name: 'Dot matrix', blurb: 'Indigo dot field.', source: 'bespoke', cls: 'bg-dots' },
      { code: c(5, 'BG'), name: 'Spotlight', blurb: 'Light follows the cursor.', source: 'bespoke', cls: 'bg-spot', data: { spotlight: '' }, js: true },
      { code: c(6, 'BG'), name: 'Floating blobs', blurb: 'Soft orbs drift.', source: 'bespoke', cls: 'bg-blobs', live: true },
      { code: c(7, 'BG'), name: 'Noise', blurb: 'Subtle film grain.', source: 'bespoke', cls: 'bg-noise' },
      { code: c(8, 'BG'), name: 'Conic rotate', blurb: 'Slow color wheel.', source: 'bespoke', cls: 'bg-conic', live: true },
      { code: c(9, 'BG'), name: 'Mesh drift', blurb: 'Soft gradient mesh breathes.', source: 'bespoke', cls: 'bg-mesh', live: true },
      { code: c(10, 'BG'), name: 'Grid pan', blurb: 'Lines scroll diagonally.', source: 'bespoke', cls: 'bg-gridpan', live: true },
    ],
  },
  {
    id: 'loaders', code: 'H', title: 'Loaders & feedback', kind: 'loader',
    desc: 'States for async work and skeletons. All animate at rest.',
    variants: [
      { code: c(1, 'LDR'), name: 'Spinner ring', blurb: 'Classic arc spinner.', source: 'bespoke', cls: 'ld-ring', live: true },
      { code: c(2, 'LDR'), name: 'Bouncing dots', blurb: 'Three-dot wave.', source: 'bespoke', cls: 'ld-dots', live: true },
      { code: c(3, 'LDR'), name: 'Indeterminate bar', blurb: 'Sliding progress bar.', source: 'bespoke', cls: 'ld-bar', live: true },
      { code: c(4, 'LDR'), name: 'Skeleton', blurb: 'Shimmering content placeholder.', source: 'bespoke', cls: 'ld-skeleton', live: true },
      { code: c(5, 'LDR'), name: 'Progress ring', blurb: 'Conic fill dial.', source: 'bespoke', cls: 'ld-prog', live: true },
    ],
  },
  {
    id: 'glass', code: 'I', title: 'Glass / backdrop-filter', kind: 'glass',
    desc: 'Frosted surfaces that blur whatever sits behind them — each panel floats over a busy scene so the effect is visible. The site nav and lightbox already use this. Note: backdrop-filter is GPU-accelerated but stacking many at once can cost paint performance.',
    variants: [
      { code: c(1, 'GLS'), name: 'Nav glass', blurb: 'rgba dark + blur(10px) — the live nav.', source: 'bespoke', cls: 'gl-nav', current: true },
      { code: c(2, 'GLS'), name: 'Frosted', blurb: 'Milky blur(10px) + hairline edge.', source: 'bespoke', cls: 'gl-frost' },
      { code: c(3, 'GLS'), name: 'Vibrant', blurb: 'blur + saturate(180%) — Apple-style.', source: 'bespoke', cls: 'gl-vibrant' },
      { code: c(4, 'GLS'), name: 'Light tint', blurb: 'Brighter, more opaque glass.', source: 'bespoke', cls: 'gl-light' },
      { code: c(5, 'GLS'), name: 'Heavy frost', blurb: 'blur(24px) — strongly obscured.', source: 'bespoke', cls: 'gl-heavy' },
      { code: c(6, 'GLS'), name: 'Teal tint', blurb: 'Accent-coloured frost.', source: 'bespoke', cls: 'gl-teal' },
      { code: c(7, 'GLS'), name: 'Grain glass', blurb: 'Frost + subtle film grain.', source: 'bespoke', cls: 'gl-noise' },
      { code: c(8, 'GLS'), name: 'Liquid (specular)', blurb: 'Inset top highlight + soft glow.', source: 'bespoke', cls: 'gl-specular' },
      { code: c(9, 'GLS'), name: 'Bright frost', blurb: 'blur + brightness(1.25).', source: 'bespoke', cls: 'gl-bright' },
      { code: c(10, 'GLS'), name: 'Smoked', blurb: 'Dark, heavy privacy glass.', source: 'bespoke', cls: 'gl-dark' },
    ],
  },
];
