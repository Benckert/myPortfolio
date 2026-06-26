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
      { code: c(1, 'BTN'), name: 'shadcn default', blurb: 'Base primary button.', source: 'shadcn', component: 'ShadcnButton', install: 'npx shadcn@latest add button', siteTarget: 'Primary CTA', props: { variant: 'default' }, label: 'Get in touch', current: true },
      { code: c(2, 'BTN'), name: 'shadcn secondary', blurb: 'Muted secondary.', source: 'shadcn', component: 'ShadcnButton', install: 'npx shadcn@latest add button', siteTarget: 'Secondary CTA', props: { variant: 'secondary' }, label: 'View work' },
      { code: c(3, 'BTN'), name: 'shadcn outline', blurb: 'Bordered ghost.', source: 'shadcn', component: 'ShadcnButton', install: 'npx shadcn@latest add button', siteTarget: 'Nav CTA', props: { variant: 'outline' }, label: 'Download CV' },
      { code: c(4, 'BTN'), name: 'Star border', blurb: 'Animated star outline.', source: 'reactbits', component: 'StarBorder', install: 'reactbits: get StarBorder (ts-tailwind)', siteTarget: 'Hero primary CTA', props: { color: '#5eead4', speed: '5s' }, label: 'Get in touch', live: true },
      { code: c(5, 'BTN'), name: 'Magnetic', blurb: 'Leans toward the cursor.', source: 'reactbits', component: 'Magnet', install: 'reactbits: get Magnet (ts-tailwind)', siteTarget: 'Contact button', props: { padding: 80, magnetStrength: 4 }, label: 'Enter terminal' },
      { code: c(6, 'BTN'), name: 'Glare hover', blurb: 'Sheen sweeps on hover.', source: 'reactbits', component: 'GlareHover', install: 'reactbits: get GlareHover (ts-tailwind)', siteTarget: 'Project CTA', props: { glareColor: '#ffffff', glareOpacity: 0.3, glareAngle: -30, width: '190px', height: '52px', borderRadius: '8px' }, label: 'View work' },
    ],
  },
  {
    id: 'portraits', code: 'B', title: 'Portrait / image', kind: 'portrait',
    desc: 'Treatments for the avatar on hover. Current is a thin, faint teal ring.',
    variants: [
      { code: c(1, 'POR'), name: 'Profile card', blurb: 'Tilt + holo avatar card.', source: 'reactbits', component: 'ProfileCard', install: 'reactbits: get ProfileCard (ts-tailwind)', siteTarget: 'About avatar', current: true, props: { avatarUrl: '/portrait.svg', name: 'Kristoffer', title: 'Developer', handle: 'kbenckert', showUserInfo: true } },
      { code: c(2, 'POR'), name: 'Tilted photo', blurb: 'Image tilts toward cursor.', source: 'reactbits', component: 'TiltedCard', install: 'reactbits: get TiltedCard (ts-tailwind)', siteTarget: 'About avatar alt', props: { imageSrc: '/portrait.svg', altText: 'Portrait', containerHeight: '220px', imageHeight: '220px', imageWidth: '220px', rotateAmplitude: 14 } },
      { code: c(3, 'POR'), name: 'Glare photo', blurb: 'Sheen sweeps the photo.', source: 'reactbits', component: 'GlareHover', install: 'reactbits: get GlareHover (ts-tailwind)', siteTarget: 'About avatar hover', props: { glareColor: '#5eead4', glareOpacity: 0.35, width: '220px', height: '220px', background: "url('/portrait.svg') center / cover, #000" } },
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
    desc: 'Surfaces for project tiles — shadcn Card as the base shell plus three reactbits card treatments.',
    variants: [
      { code: c(1, 'CRD'), name: 'shadcn Card', blurb: 'Base shadcn surface.', source: 'shadcn', component: 'ShadcnCard', install: 'npx shadcn@latest add card', siteTarget: 'Project tile shell' },
      { code: c(2, 'CRD'), name: 'Tilted', blurb: '3D tilt toward cursor.', source: 'reactbits', component: 'TiltedCard', install: 'reactbits: get TiltedCard (ts-tailwind)', siteTarget: 'Project card hover', props: { imageSrc: '/portrait.svg', altText: 'Project', captionText: 'Realtime dashboard', containerHeight: '220px', rotateAmplitude: 12, scaleOnHover: 1.05 } },
      { code: c(3, 'CRD'), name: 'Spotlight', blurb: 'Glow follows the cursor.', source: 'reactbits', component: 'SpotlightCard', install: 'reactbits: get SpotlightCard (ts-tailwind)', siteTarget: 'Project card', props: { spotlightColor: 'rgba(94,234,212,0.25)' }, label: 'Realtime dashboard' },
      { code: c(4, 'CRD'), name: 'Magic Bento', blurb: 'Glow grid panel.', source: 'reactbits', component: 'MagicBento', install: 'reactbits: get MagicBento (ts-tailwind)', siteTarget: 'Projects grid', props: { glowColor: '94, 234, 212', enableSpotlight: true } },
      { code: c(5, 'CRD'), name: 'Pixel', blurb: 'Pixel-reveal on hover.', source: 'reactbits', component: 'PixelCard', install: 'reactbits: get PixelCard (ts-tailwind)', siteTarget: 'Project card alt', props: { variant: 'default' }, label: 'Realtime dashboard' },
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
      { code: c(1, 'TXT'), name: 'Split reveal', blurb: 'Letters spring up on view.', source: 'reactbits', component: 'SplitText', install: 'reactbits: get SplitText (ts-tailwind) → src/components/reactbits/SplitText.tsx', siteTarget: 'Hero <h1>', props: { text: 'Kristoffer', delay: 40, duration: 0.6, splitType: 'chars' } },
      { code: c(2, 'TXT'), name: 'Blur in', blurb: 'Words focus from blur.', source: 'reactbits', component: 'BlurText', install: 'reactbits: get BlurText (ts-tailwind)', siteTarget: 'Section headings', props: { text: 'Kristoffer', delay: 120, animateBy: 'words' } },
      { code: c(3, 'TXT'), name: 'Decrypt', blurb: 'Scrambles then resolves.', source: 'reactbits', component: 'DecryptedText', install: 'reactbits: get DecryptedText (ts-tailwind)', siteTarget: 'Hero eyebrow', props: { text: 'Kristoffer', animateOn: 'view', sequential: true, revealDirection: 'start' }, live: true },
      { code: c(4, 'TXT'), name: 'Glitch', blurb: 'RGB-split flicker.', source: 'reactbits', component: 'GlitchText', install: 'reactbits: get GlitchText (ts-tailwind)', siteTarget: 'Terminal CTA label', props: { speed: 1, enableShadows: true }, label: 'Kristoffer', live: true },
      { code: c(5, 'TXT'), name: 'Gradient drift', blurb: 'Accent gradient animates.', source: 'reactbits', component: 'GradientText', install: 'reactbits: get GradientText (ts-tailwind)', siteTarget: 'Hero name', props: { colors: ['#5eead4', '#818cf8', '#5eead4'], animationSpeed: 6 }, label: 'Kristoffer', live: true },
      { code: c(6, 'TXT'), name: 'Shiny sweep', blurb: 'Light sweeps the text.', source: 'reactbits', component: 'ShinyText', install: 'reactbits: get ShinyText (ts-tailwind)', siteTarget: 'Download CV button label', props: { text: 'Kristoffer', speed: 3 }, live: true },
      { code: c(7, 'TXT'), name: 'Scramble on hover', blurb: 'Decrypts under the cursor.', source: 'reactbits', component: 'ScrambledText', install: 'reactbits: get ScrambledText (ts-tailwind)', siteTarget: 'About heading', props: { radius: 100, duration: 1.2, speed: 0.5 }, label: 'Kristoffer' },
      { code: c(8, 'TXT'), name: 'Typed', blurb: 'Types and retypes a list.', source: 'reactbits', component: 'TextType', install: 'reactbits: get TextType (ts-tailwind)', siteTarget: 'Hero subtitle role', props: { text: ['Developer', 'Designer', 'Builder'], typingSpeed: 70, pauseDuration: 1200, showCursor: true }, live: true },
      { code: c(9, 'TXT'), name: 'Rotating', blurb: 'Swaps words on a timer.', source: 'reactbits', component: 'RotatingText', install: 'reactbits: get RotatingText (ts-tailwind)', siteTarget: 'Hero tagline word', props: { texts: ['ships', 'designs', 'builds'], rotationInterval: 2000 }, live: true },
    ],
  },
  {
    id: 'backgrounds', code: 'G', title: 'Ambient backgrounds', kind: 'bg',
    desc: 'Section / hero atmospheres — reactbits WebGL and canvas components. WebGL ones lazy-load so the bench stays responsive.',
    variants: [
      { code: c(1, 'BG'), name: 'Aurora', blurb: 'Drifting colour clouds.', source: 'reactbits', component: 'Aurora', install: 'reactbits: get Aurora (ts-tailwind) + npm i ogl', siteTarget: 'Hero backdrop', props: { colorStops: ['#5eead4', '#818cf8', '#5eead4'], amplitude: 1.0, blend: 0.5 }, live: true },
      { code: c(2, 'BG'), name: 'Particles', blurb: 'Floating particle field.', source: 'reactbits', component: 'Particles', install: 'reactbits: get Particles (ts-tailwind) + npm i ogl', siteTarget: 'Section divider', props: { particleColors: ['#5eead4', '#818cf8'], particleCount: 160, moveParticlesOnHover: true }, live: true },
      { code: c(3, 'BG'), name: 'Liquid chrome', blurb: 'Molten metallic flow.', source: 'reactbits', component: 'LiquidChrome', install: 'reactbits: get LiquidChrome (ts-tailwind) + npm i ogl', siteTarget: 'Contact backdrop', props: { baseColor: [0.1, 0.13, 0.18] as [number, number, number], speed: 0.2, amplitude: 0.5, interactive: true }, live: true },
      { code: c(4, 'BG'), name: 'Iridescence', blurb: 'Holographic colour shimmer.', source: 'reactbits', component: 'Iridescence', install: 'reactbits: get Iridescence (ts-tailwind) + npm i ogl', siteTarget: 'Hero backdrop alt', props: { color: [0.4, 0.7, 0.9] as [number, number, number], speed: 1.0, amplitude: 0.1, mouseReact: true }, live: true },
      { code: c(5, 'BG'), name: 'Waves', blurb: 'Line-wave field.', source: 'reactbits', component: 'Waves', install: 'reactbits: get Waves (ts-tailwind)', siteTarget: 'Footer backdrop', props: { lineColor: '#5eead4', backgroundColor: 'transparent' }, live: true },
      { code: c(6, 'BG'), name: 'Threads', blurb: 'Wavy thread lines.', source: 'reactbits', component: 'Threads', install: 'reactbits: get Threads (ts-tailwind) + npm i ogl', siteTarget: 'About backdrop', props: { color: [0.37, 0.92, 0.83] as [number, number, number], amplitude: 1 }, live: true },
      { code: c(7, 'BG'), name: 'Dot grid', blurb: 'Reactive dot matrix.', source: 'reactbits', component: 'DotGrid', install: 'reactbits: get DotGrid (ts-tailwind)', siteTarget: 'Skills backdrop', props: { dotSize: 4, gap: 24, baseColor: '#1e293b', activeColor: '#5eead4' } },
      { code: c(8, 'BG'), name: 'Squares', blurb: 'Scrolling square grid.', source: 'reactbits', component: 'Squares', install: 'custom canvas fallback (reactbits Squares source 404 — re-fetch when available)', siteTarget: 'Projects backdrop', props: { speed: 0.5, squareSize: 40, borderColor: '#1e293b' }, live: true },
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
