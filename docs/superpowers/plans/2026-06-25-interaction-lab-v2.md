# Interaction Lab v2 — Library-Backed Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the dev-only Interaction Lab so its specimens are *real* reactbits/shadcn components (families F, G, D, A, B, H, I) instead of hand-written CSS mocks, AND give the lab *surface itself* a deliberate UI/UX pass — while keeping C (chips) and E (links) bespoke.

**Architecture:** The lab stays a pure **data → render** machine. `effects.ts` remains pure, unit-testable data; each library specimen gains a string `component:` key plus `install:`/`siteTarget:`/`props:` metadata. A new `registry.tsx` maps those name strings to real React components (WebGL backgrounds via `React.lazy`). `Lab.tsx`'s `Demo` gains one generic `<LibDemo>` branch (`registry[v.component]` + `Suspense` + spread props); bespoke families keep their existing CSS rendering. Reactbits sources are copied into `src/components/reactbits/` via the reactbits MCP `get_component_code`; shadcn primitives are generated into `src/components/ui/`. The lab is never in the production build, so its extra deps never ship.

**Tech Stack:** React 19, Vite, TypeScript (strict), Tailwind v4 + shadcn/ui (`--color-*` bridge), reactbits (copied source), `motion` (reactbits' renamed framer-motion), Vitest + Testing Library.

## Global Constraints

- **Branch:** all work happens on `explore/ui-lab-v2` (already created off `master`; the lab shell is already ported and the foundation is green — see Task 1). This branch is **never merged to master** — it carries heavy dev-only deps.
- **Lab is dev-only:** `vite build` must continue to bundle only `index.html`. Never add `lab.html` to `build.rollupOptions.input`.
- **`effects.ts` stays pure data** (no JSX, no React imports). Component references are **strings** resolved through `registry.tsx`. This keeps it importable by Vitest without rendering.
- **No shadcn primitives exist yet.** `src/components/ui/` is empty on this branch; `components.json`, `cn()` (`src/lib/utils.ts`), and `globals.css` token bridge ARE present. Any shadcn component must be generated with `npx shadcn@latest add <name>` inside its task.
- **Token bridge is law** (CLAUDE.md Architecture §3): never redefine a bare token (`--muted`, `--accent`, `--border`) to shadcn semantics; add theme colors via `@theme inline` (`--color-*`). The site is dark-only (`<html class="dark">`); the lab pulls tokens via `main.tsx` → `../styles/globals.css`.
- **TypeScript is the gate:** `strict` + `noUnusedLocals`/`noUnusedParameters`. `npm run build` must pass; there is no separate lint.
- **`@/` alias maps to `src/`** (`vite.config.ts` + `tsconfig.app.json` `paths`). Imports use `@/components/...`.
- **Portrait asset is `/portrait.svg`** (in `public/`). There is no `portrait.jpg`. Use `/portrait.svg` for any image specimen.
- **Reactbits prop names come from the fetched source.** The `props:` objects in this plan are the *intended configuration*; when wiring a component, reconcile prop names against the actual fetched component API and fix mismatches. This is normal, not a placeholder.
- **WebGL/3D/physics specimens are lazy.** Any reactbits component whose fetched source imports `ogl`, `three`, `@react-three/*`, or `matter-js` MUST be registered via `React.lazy` and added to the `lazyKeys` set, never eager-imported (these are heavy and hostile to jsdom). **`gsap` is exempt** — gsap-based text/UI widgets (e.g. SplitText, ScrambledText, TextType, possibly MagicBento) are small, render in bulk, and work in jsdom, so they are eager-imported. (Decision recorded during Task 3.)
- **`three` / `@react-three/fiber` are EXCLUDED entirely.** `@react-three/fiber`'s global JSX namespace augmentation collapses React 19 intrinsic elements (`<p>`, `React.ElementType`, …) to `never` *project-wide* — and because `tsc -b` compiles every file under the `src/` include glob, merely having a three-importing file on disk breaks the build regardless of whether it is imported or lazy-loaded (lazy isolates runtime/bundle, not compile-time type augmentation). Therefore **prefer `ogl`-based reactbits components**; never add a component whose source imports `three`/`@react-three/*`/`drei`. (Decision recorded during Task 4: Beams + Silk — both three.js — were replaced with the ogl-based **LiquidChrome** and **Iridescence**.)
- **Keep the existing 70 tests green** at every task boundary.
- **Verify visually** at each family task using the chrome-devtools MCP against `http://localhost:5173/lab.html` (a dev server is already running; `navigate_page` → `take_snapshot`; `take_screenshot` only when a snapshot is insufficient).
- **Reactbits fetch mechanism:** use the reactbits MCP `get_component_code` with `version: "ts-tailwind"`; if the tool isn't immediately listed, load it via tool search (`select:mcp__reactbits__get_component_code`). Save each to `src/components/reactbits/<Name>.tsx`, ensure a **default export**, and scan its imports for stray bare modules to `npm install`.
- **Commit cadence:** one commit per task minimum, conventional-commit messages, end every commit message with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

### Task 1: Foundation — new branch off master, port shell, add `motion` ✅ (done by orchestrator)

**Status: COMPLETE.** Recorded here for provenance; do not re-dispatch.

What was done: created `explore/ui-lab-v2` off `master`; ported `src/lab/**` + `lab.html` from `explore/ui-effects-lab`; `npm install motion`; verified `npm run build` (type-check + vite build emitting only `index.html`) and `npm test` (70 passed); confirmed `lab.html` renders all 93 original specimens via chrome-devtools. The original lab footer still reads `explore/ui-effects-lab` — Task 11 updates it to `explore/ui-lab-v2`.

---

### Task 2: Catalog schema + registry scaffold + integrity test (TDD anchor)

Evolve the `Variant` type and add the empty registry and the integrity test that encodes the v2 contract. No visual change yet: every existing specimen is tagged `source: 'bespoke'` so the lab renders exactly as before, but the rails for library conversion now exist and are tested.

**Files:**
- Modify: `src/lab/effects.ts` (extend `Variant`; add `source: 'bespoke'` to **every** existing variant — there are 93)
- Create: `src/lab/registry.tsx`
- Create: `src/lab/effects.test.ts`

**Interfaces:**
- Produces:
  - `type Source = 'bespoke' | 'reactbits' | 'shadcn'`
  - `Variant` gains: `source: Source`, `component?: string`, `install?: string`, `props?: Record<string, unknown>`, `siteTarget?: string`
  - `registry: Record<string, ComponentType<any>>` and `lazyKeys: Set<string>` exported from `registry.tsx`
- Consumes: nothing new.

- [ ] **Step 1: Write the failing integrity test** — create `src/lab/effects.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { categories } from './effects';
import { registry } from './registry';

const all = categories.flatMap((c) => c.variants);

describe('lab catalog integrity', () => {
  it('every specimen code is unique', () => {
    const codes = all.map((v) => v.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('every variant declares a valid source', () => {
    for (const v of all) {
      expect(['bespoke', 'reactbits', 'shadcn'], v.code).toContain(v.source);
    }
  });

  it('library specimens carry a resolvable component + install + siteTarget', () => {
    for (const v of all.filter((v) => v.source !== 'bespoke')) {
      expect(v.component, `${v.code} needs a component name`).toBeTruthy();
      expect(registry[v.component!], `${v.code} → ${v.component} missing from registry`).toBeTruthy();
      expect(v.install, `${v.code} needs an install command`).toBeTruthy();
      expect(v.siteTarget, `${v.code} needs a siteTarget`).toBeTruthy();
    }
  });

  it('bespoke specimens carry a cls or data hook', () => {
    for (const v of all.filter((v) => v.source === 'bespoke')) {
      expect(Boolean(v.cls || v.data), `${v.code} bespoke needs cls/data`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run it — verify it fails**

```bash
npx vitest run src/lab/effects.test.ts
```
Expected: FAIL — `registry.tsx` does not exist (import error) and `v.source` is undefined on every variant.

- [ ] **Step 3: Extend the `Variant` type and create the registry**

In `src/lab/effects.ts`, replace the `Variant` interface with:

```ts
export type Source = 'bespoke' | 'reactbits' | 'shadcn';

export interface Variant {
  code: string;
  name: string;
  blurb: string;
  source: Source;                  // where this specimen comes from
  component?: string;              // registry key (required when source !== 'bespoke')
  install?: string;               // exact command to ship it
  props?: Record<string, unknown>; // props passed to the library component
  siteTarget?: string;            // where this would live on the real site
  cls?: string;                   // bespoke: modifier class
  style?: Record<string, string>;
  data?: Record<string, string>; // bespoke: data-* hooks for behaviors.ts
  label?: string;
  current?: boolean;
  js?: boolean;
  live?: boolean;
}
```

Create `src/lab/registry.tsx` (empty to start — fills in later tasks):

```tsx
import type { ComponentType } from 'react';

// Maps a Variant.component string to a real React component.
// WebGL/heavy components are added via React.lazy and listed in lazyKeys.
export const registry: Record<string, ComponentType<any>> = {};

// Keys whose components are lazy-loaded (WebGL/3D/physics). LibDemo wraps these in Suspense.
export const lazyKeys = new Set<string>();
```

- [ ] **Step 4: Tag every existing variant `source: 'bespoke'`** — add `source: 'bespoke',` to all 93 existing variants across families A–I in `effects.ts`. Mechanical edit; each variant object gains the field. Leave all other fields untouched.

- [ ] **Step 5: Run the test — verify it passes**

```bash
npx vitest run src/lab/effects.test.ts
```
Expected: PASS (no library specimens yet; all bespoke variants have `cls`).

- [ ] **Step 6: Full suite + build still green**

```bash
npm test && npm run build
```
Expected: all tests pass; build clean.

- [ ] **Step 7: Commit**

```bash
git add src/lab/effects.ts src/lab/registry.tsx src/lab/effects.test.ts
git commit -m "feat(lab): add v2 catalog schema, registry scaffold, integrity test"
```

---

### Task 3: Family F (Headings) → reactbits text animations + generic LibDemo

The template conversion. Establishes the generic `<LibDemo>` renderer in `Lab.tsx` (reused by every later family) and converts F to nine reactbits text components.

**Components (fetch `ts-tailwind` via reactbits MCP `get_component_code` → `src/components/reactbits/<Name>.tsx`):**
SplitText, BlurText, DecryptedText, GlitchText, GradientText, ShinyText, ScrambledText, TextType, RotatingText. (All need only `react` + `motion`, both present.)

**Files:**
- Create: `src/components/reactbits/{SplitText,BlurText,DecryptedText,GlitchText,GradientText,ShinyText,ScrambledText,TextType,RotatingText}.tsx`
- Modify: `src/lab/registry.tsx` (register the nine)
- Modify: `src/lab/Lab.tsx` (add `LibDemo`; route `source !== 'bespoke'` to it)
- Modify: `src/lab/effects.ts` (rewrite family F variants)

**Interfaces:**
- Consumes: `registry`, `lazyKeys`, `Variant` schema (Task 2).
- Produces: `LibDemo` rendering convention — `registry[v.component]` rendered inside `<Suspense>`, props spread from `v.props`, `v.label` passed as children. Every later family relies on this and only adds registry entries + catalog data.

- [ ] **Step 1: Fetch + save the nine reactbits sources** (per Global Constraints fetch mechanism). Ensure each default-exports its component.

- [ ] **Step 2: Register the nine** in `src/lab/registry.tsx`:

```tsx
import type { ComponentType } from 'react';
import SplitText from '@/components/reactbits/SplitText';
import BlurText from '@/components/reactbits/BlurText';
import DecryptedText from '@/components/reactbits/DecryptedText';
import GlitchText from '@/components/reactbits/GlitchText';
import GradientText from '@/components/reactbits/GradientText';
import ShinyText from '@/components/reactbits/ShinyText';
import ScrambledText from '@/components/reactbits/ScrambledText';
import TextType from '@/components/reactbits/TextType';
import RotatingText from '@/components/reactbits/RotatingText';

export const registry: Record<string, ComponentType<any>> = {
  SplitText, BlurText, DecryptedText, GlitchText, GradientText,
  ShinyText, ScrambledText, TextType, RotatingText,
};

export const lazyKeys = new Set<string>();
```

- [ ] **Step 3: Add `LibDemo` to `Lab.tsx` and route library specimens to it**

Add imports at top of `src/lab/Lab.tsx`:
```tsx
import { Suspense } from 'react';
import { registry } from './registry';
```
Add the component (above `Demo`):
```tsx
function LibDemo({ v }: { v: Variant }) {
  const C = registry[v.component!];
  if (!C) return <span className="spec__missing">missing: {v.component}</span>;
  return (
    <Suspense fallback={<span className="spec__loading">loading…</span>}>
      <C {...(v.props ?? {})}>{v.label}</C>
    </Suspense>
  );
}
```
At the **top of `Demo`'s body**, before the `switch`, short-circuit library specimens:
```tsx
function Demo({ kind, v }: { kind: Category['kind']; v: Variant }) {
  if (v.source !== 'bespoke') return <LibDemo v={v} />;
  const cls = v.cls ?? '';
  // …existing bespoke switch unchanged…
```

- [ ] **Step 4: Rewrite family F variants** in `effects.ts` (reconcile prop names against fetched sources per Global Constraints):

```ts
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
```

- [ ] **Step 5: Integrity test — verify F resolves** — `npx vitest run src/lab/effects.test.ts` → PASS.
- [ ] **Step 6: Build + full suite** — `npm run build && npm test` → clean, all pass.
- [ ] **Step 7: Visual verification** — chrome-devtools `navigate_page` → `http://localhost:5173/lab.html#headings`, `take_snapshot`. Confirm the nine F specimens render real components and animate. Fix prop mismatches; re-verify.
- [ ] **Step 8: Commit**

```bash
git add src/components/reactbits src/lab/registry.tsx src/lab/Lab.tsx src/lab/effects.ts
git commit -m "feat(lab): convert Headings (F) to reactbits text animations via LibDemo"
```

---

### Task 4: Family G (Backgrounds) → reactbits backgrounds (lazy WebGL)

Convert ambient backgrounds to reactbits. **As built:** the WebGL ones — Aurora, Particles, LiquidChrome, Iridescence, Threads (all `ogl`) — are **lazy** so the bench stays responsive; the canvas/gsap-light ones (Waves, DotGrid, Squares) are eager. Beams + Silk (the originally-planned picks) were dropped: both import `three`/`@react-three/fiber`, which breaks the build project-wide (see Global Constraints) — they were replaced with the ogl-based **LiquidChrome** and **Iridescence**.

**Components (fetch `ts-tailwind`):** Aurora, Particles, Beams, Silk, Waves, Threads, DotGrid, Squares.

**Files:**
- Create: `src/components/reactbits/{Aurora,Particles,Beams,Silk,Waves,Threads,DotGrid,Squares}.tsx`
- Modify: `src/lab/registry.tsx` (lazy-register WebGL ones; add to `lazyKeys`)
- Modify: `src/lab/effects.ts` (rewrite family G)
- Modify: `src/lab/lab.css` (ensure the `bg` specimen stage has a fixed min-height so full-bleed backgrounds are visible)

**Interfaces:**
- Consumes: `LibDemo` (Task 3), `registry`/`lazyKeys` (Task 2).
- Produces: lazy-registration pattern reused by any later heavy component.

- [ ] **Step 1: Fetch + save the eight sources.** Scan imports: WebGL ones import `ogl` → `npm install ogl` once. Ensure default exports.
- [ ] **Step 2: Lazy-register in `registry.tsx`** — add `import { lazy } from 'react'`, define `const Aurora = lazy(() => import('@/components/reactbits/Aurora'))` (and Particles, Beams, Silk, Threads); eager-import any that need no WebGL (e.g. `Waves`, `DotGrid`, `Squares` — adjust based on actual imports). Add all eight to `registry`. Set `lazyKeys` to the WebGL subset, e.g. `new Set(['Aurora','Particles','Beams','Silk','Threads'])` (include `Waves` if it imports ogl).
- [ ] **Step 3: Rewrite family G variants** in `effects.ts`:

```ts
variants: [
  { code: c(1, 'BG'), name: 'Aurora', blurb: 'Drifting colour clouds.', source: 'reactbits', component: 'Aurora', install: 'reactbits: get Aurora (ts-tailwind) + npm i ogl', siteTarget: 'Hero backdrop', props: { colorStops: ['#5eead4', '#818cf8', '#5eead4'], amplitude: 1.0, blend: 0.5 }, live: true },
  { code: c(2, 'BG'), name: 'Particles', blurb: 'Floating particle field.', source: 'reactbits', component: 'Particles', install: 'reactbits: get Particles (ts-tailwind) + npm i ogl', siteTarget: 'Section divider', props: { particleColors: ['#5eead4', '#818cf8'], particleCount: 160, moveParticlesOnHover: true }, live: true },
  { code: c(3, 'BG'), name: 'Beams', blurb: 'Light beams sweep.', source: 'reactbits', component: 'Beams', install: 'reactbits: get Beams (ts-tailwind) + npm i ogl', siteTarget: 'Contact backdrop', props: { beamWidth: 2, beamNumber: 12, speed: 2 }, live: true },
  { code: c(4, 'BG'), name: 'Silk', blurb: 'Flowing silk shader.', source: 'reactbits', component: 'Silk', install: 'reactbits: get Silk (ts-tailwind) + npm i ogl', siteTarget: 'Hero backdrop alt', props: { speed: 5, scale: 1, color: '#1e293b' }, live: true },
  { code: c(5, 'BG'), name: 'Waves', blurb: 'Line-wave field.', source: 'reactbits', component: 'Waves', install: 'reactbits: get Waves (ts-tailwind)', siteTarget: 'Footer backdrop', props: { lineColor: '#5eead4', backgroundColor: 'transparent' }, live: true },
  { code: c(6, 'BG'), name: 'Threads', blurb: 'Wavy thread lines.', source: 'reactbits', component: 'Threads', install: 'reactbits: get Threads (ts-tailwind) + npm i ogl', siteTarget: 'About backdrop', props: { color: [0.37, 0.92, 0.83], amplitude: 1 }, live: true },
  { code: c(7, 'BG'), name: 'Dot grid', blurb: 'Reactive dot matrix.', source: 'reactbits', component: 'DotGrid', install: 'reactbits: get DotGrid (ts-tailwind)', siteTarget: 'Skills backdrop', props: { dotSize: 4, gap: 24, baseColor: '#1e293b', activeColor: '#5eead4' } },
  { code: c(8, 'BG'), name: 'Squares', blurb: 'Scrolling square grid.', source: 'reactbits', component: 'Squares', install: 'reactbits: get Squares (ts-tailwind)', siteTarget: 'Projects backdrop', props: { speed: 0.5, squareSize: 40, borderColor: '#1e293b' }, live: true },
],
```

- [ ] **Step 4: Ensure the bg specimen stage has height** in `lab.css` (e.g. a `min-height: 160px` on the backgrounds section's specimen stage), without breaking other families.
- [ ] **Step 5: Integrity + build + suite** — `npx vitest run src/lab/effects.test.ts && npm run build && npm test` → all pass (lazy keys resolve without importing `ogl` into jsdom).
- [ ] **Step 6: Visual verification** — `lab.html#backgrounds` snapshot + screenshot. Confirm WebGL backgrounds lazy-load and render, no console errors, page stays responsive. Fix prop mismatches.
- [ ] **Step 7: Commit**

```bash
git add src/components/reactbits src/lab/registry.tsx src/lab/effects.ts src/lab/lab.css
git commit -m "feat(lab): convert Backgrounds (G) to reactbits, lazy-loaded WebGL"
```

---

### Task 5: Family D (Cards) → reactbits cards + shadcn Card

**Components:** reactbits TiltedCard, SpotlightCard, MagicBento, PixelCard; shadcn `card`.

**Files:**
- Create: `src/components/reactbits/{TiltedCard,SpotlightCard,MagicBento,PixelCard}.tsx`
- Add: `src/components/ui/card.tsx` via `npx shadcn@latest add card`
- Modify: `src/lab/registry.tsx`, `src/lab/effects.ts`

**Interfaces:**
- Consumes: `LibDemo`, registry. Produces: shadcn-adapter registration pattern (`source: 'shadcn'`).

- [ ] **Step 1: Add shadcn Card + fetch reactbits sources** — `npx shadcn@latest add card`; fetch TiltedCard, SpotlightCard, MagicBento, PixelCard (`ts-tailwind`). Scan imports; if MagicBento imports `gsap`, `npm install gsap`, register it `lazy`, add `'MagicBento'` to `lazyKeys`. Ensure default exports.
- [ ] **Step 2: Register** — add eager `TiltedCard, SpotlightCard, PixelCard` (and lazy `MagicBento` if heavy) plus a shadcn Card adapter to `registry`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
function ShadcnCardDemo() {
  return (
    <Card className="w-64">
      <CardHeader><CardTitle>Realtime dashboard</CardTitle></CardHeader>
      <CardContent>Live metrics over WebSockets with an offline cache.</CardContent>
    </Card>
  );
}
// registry: { ..., TiltedCard, SpotlightCard, PixelCard, MagicBento, ShadcnCard: ShadcnCardDemo }
```

- [ ] **Step 3: Rewrite family D variants** in `effects.ts`:

```ts
variants: [
  { code: c(1, 'CRD'), name: 'shadcn Card', blurb: 'Base shadcn surface.', source: 'shadcn', component: 'ShadcnCard', install: 'npx shadcn@latest add card', siteTarget: 'Project tile shell' },
  { code: c(2, 'CRD'), name: 'Tilted', blurb: '3D tilt toward cursor.', source: 'reactbits', component: 'TiltedCard', install: 'reactbits: get TiltedCard (ts-tailwind)', siteTarget: 'Project card hover', props: { imageSrc: '/portrait.svg', altText: 'Project', captionText: 'Realtime dashboard', containerHeight: '220px', rotateAmplitude: 12, scaleOnHover: 1.05 } },
  { code: c(3, 'CRD'), name: 'Spotlight', blurb: 'Glow follows the cursor.', source: 'reactbits', component: 'SpotlightCard', install: 'reactbits: get SpotlightCard (ts-tailwind)', siteTarget: 'Project card', props: { spotlightColor: 'rgba(94,234,212,0.25)' }, label: 'Realtime dashboard' },
  { code: c(4, 'CRD'), name: 'Magic Bento', blurb: 'Glow grid panel.', source: 'reactbits', component: 'MagicBento', install: 'reactbits: get MagicBento (ts-tailwind)', siteTarget: 'Projects grid', props: { glowColor: '94, 234, 212', enableSpotlight: true } },
  { code: c(5, 'CRD'), name: 'Pixel', blurb: 'Pixel-reveal on hover.', source: 'reactbits', component: 'PixelCard', install: 'reactbits: get PixelCard (ts-tailwind)', siteTarget: 'Project card alt', props: { variant: 'default' }, label: 'Realtime dashboard' },
],
```

- [ ] **Step 4: Integrity + build + suite + visual** — `npx vitest run src/lab/effects.test.ts && npm run build && npm test`; then `lab.html#cards` snapshot. Fix prop mismatches.
- [ ] **Step 5: Commit**

```bash
git add src/components/reactbits src/components/ui/card.tsx src/lab/registry.tsx src/lab/effects.ts
git commit -m "feat(lab): convert Cards (D) to reactbits + shadcn Card"
```

---

### Task 6: Family A (Buttons) → shadcn Button + reactbits effects

**Components:** shadcn `button` (NOT yet present — must be added); reactbits StarBorder, Magnet, GlareHover.

**Files:**
- Add: `src/components/ui/button.tsx` via `npx shadcn@latest add button`
- Create: `src/components/reactbits/{StarBorder,Magnet,GlareHover}.tsx`
- Modify: `src/lab/registry.tsx`, `src/lab/effects.ts`

- [ ] **Step 1: Add shadcn Button + fetch reactbits sources** — `npx shadcn@latest add button`; fetch StarBorder, Magnet, GlareHover (`ts-tailwind`; need only `motion`). Default-export.
- [ ] **Step 2: Register** — a shadcn Button adapter + the three reactbits wrappers:

```tsx
import { Button } from '@/components/ui/button';
function ShadcnButton({ variant = 'default', children }: { variant?: string; children?: React.ReactNode }) {
  return <Button variant={variant as any}>{children ?? 'View work'}</Button>;
}
// registry: { ..., ShadcnButton, StarBorder, Magnet, GlareHover }
```

- [ ] **Step 3: Rewrite family A variants** in `effects.ts`:

```ts
variants: [
  { code: c(1, 'BTN'), name: 'shadcn default', blurb: 'Base primary button.', source: 'shadcn', component: 'ShadcnButton', install: 'npx shadcn@latest add button', siteTarget: 'Primary CTA', props: { variant: 'default' }, label: 'Get in touch', current: true },
  { code: c(2, 'BTN'), name: 'shadcn secondary', blurb: 'Muted secondary.', source: 'shadcn', component: 'ShadcnButton', install: 'npx shadcn@latest add button', siteTarget: 'Secondary CTA', props: { variant: 'secondary' }, label: 'View work' },
  { code: c(3, 'BTN'), name: 'shadcn outline', blurb: 'Bordered ghost.', source: 'shadcn', component: 'ShadcnButton', install: 'npx shadcn@latest add button', siteTarget: 'Nav CTA', props: { variant: 'outline' }, label: 'Download CV' },
  { code: c(4, 'BTN'), name: 'Star border', blurb: 'Animated star outline.', source: 'reactbits', component: 'StarBorder', install: 'reactbits: get StarBorder (ts-tailwind)', siteTarget: 'Hero primary CTA', props: { color: '#5eead4', speed: '5s' }, label: 'Get in touch', live: true },
  { code: c(5, 'BTN'), name: 'Magnetic', blurb: 'Leans toward the cursor.', source: 'reactbits', component: 'Magnet', install: 'reactbits: get Magnet (ts-tailwind)', siteTarget: 'Contact button', props: { padding: 80, magnetStrength: 4 }, label: 'Enter terminal' },
  { code: c(6, 'BTN'), name: 'Glare hover', blurb: 'Sheen sweeps on hover.', source: 'reactbits', component: 'GlareHover', install: 'reactbits: get GlareHover (ts-tailwind)', siteTarget: 'Project CTA', props: { glareColor: '#ffffff', glareOpacity: 0.3, glareAngle: -30 }, label: 'View work' },
],
```

- [ ] **Step 4: Integrity + build + suite + visual** — checks then `lab.html#buttons` snapshot. Fix prop mismatches.
- [ ] **Step 5: Commit**

```bash
git add src/components/reactbits src/components/ui/button.tsx src/lab/registry.tsx src/lab/effects.ts
git commit -m "feat(lab): convert Buttons (A) to shadcn Button + reactbits effects"
```

---

### Task 7: Family B (Portraits) → reactbits ProfileCard / TiltedCard / GlareHover

**Components:** reactbits ProfileCard (new); TiltedCard (registered in Task 5 — reuse); GlareHover (registered in Task 6 — reuse).

**Files:**
- Create: `src/components/reactbits/ProfileCard.tsx`
- Modify: `src/lab/registry.tsx` (add ProfileCard), `src/lab/effects.ts`

- [ ] **Step 1: Fetch ProfileCard** (`ts-tailwind`) → save; scan imports; default-export. Register `ProfileCard`.
- [ ] **Step 2: Rewrite family B variants** in `effects.ts` (reuse `TiltedCard`/`GlareHover` already in registry):

```ts
variants: [
  { code: c(1, 'POR'), name: 'Profile card', blurb: 'Tilt + holo avatar card.', source: 'reactbits', component: 'ProfileCard', install: 'reactbits: get ProfileCard (ts-tailwind)', siteTarget: 'About avatar', current: true, props: { avatarUrl: '/portrait.svg', name: 'Kristoffer', title: 'Developer', handle: 'kbenckert', showUserInfo: true } },
  { code: c(2, 'POR'), name: 'Tilted photo', blurb: 'Image tilts toward cursor.', source: 'reactbits', component: 'TiltedCard', install: 'reactbits: get TiltedCard (ts-tailwind)', siteTarget: 'About avatar alt', props: { imageSrc: '/portrait.svg', altText: 'Portrait', containerHeight: '220px', imageHeight: '220px', imageWidth: '220px', rotateAmplitude: 14 } },
  { code: c(3, 'POR'), name: 'Glare photo', blurb: 'Sheen sweeps the photo.', source: 'reactbits', component: 'GlareHover', install: 'reactbits: get GlareHover (ts-tailwind)', siteTarget: 'About avatar hover', props: { glareColor: '#5eead4', glareOpacity: 0.35, width: '220px', height: '220px' } },
],
```

- [ ] **Step 3: Integrity + build + suite + visual** — checks then `lab.html#portraits` snapshot. Fix prop mismatches.
- [ ] **Step 4: Commit**

```bash
git add src/components/reactbits/ProfileCard.tsx src/lab/registry.tsx src/lab/effects.ts
git commit -m "feat(lab): convert Portraits (B) to reactbits ProfileCard/TiltedCard/GlareHover"
```

---

### Task 8: Family H (Loaders) → shadcn Skeleton + kept-bespoke states

Add a shadcn `Skeleton` specimen; keep the simple CSS loaders (spinner, dots, bar, progress ring) bespoke — they have no meaningful library equivalent and are tiny.

**Files:**
- Add: `src/components/ui/skeleton.tsx` via `npx shadcn@latest add skeleton`
- Modify: `src/lab/registry.tsx`, `src/lab/effects.ts`

- [ ] **Step 1: Add shadcn Skeleton** — `npx shadcn@latest add skeleton`; register an adapter:

```tsx
import { Skeleton } from '@/components/ui/skeleton';
function ShadcnSkeleton() {
  return (
    <div className="flex flex-col gap-2 w-56">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
// registry: { ..., ShadcnSkeleton }
```

- [ ] **Step 2: Update family H variants** in `effects.ts` — convert the skeleton entry, keep the other four bespoke:

```ts
variants: [
  { code: c(1, 'LDR'), name: 'Spinner ring', blurb: 'Classic arc spinner.', source: 'bespoke', cls: 'ld-ring', live: true },
  { code: c(2, 'LDR'), name: 'Bouncing dots', blurb: 'Three-dot wave.', source: 'bespoke', cls: 'ld-dots', live: true },
  { code: c(3, 'LDR'), name: 'Indeterminate bar', blurb: 'Sliding progress bar.', source: 'bespoke', cls: 'ld-bar', live: true },
  { code: c(4, 'LDR'), name: 'shadcn Skeleton', blurb: 'Pulsing content placeholder.', source: 'shadcn', component: 'ShadcnSkeleton', install: 'npx shadcn@latest add skeleton', siteTarget: 'Project/skeleton loading state', live: true },
  { code: c(5, 'LDR'), name: 'Progress ring', blurb: 'Conic fill dial.', source: 'bespoke', cls: 'ld-prog', live: true },
],
```

- [ ] **Step 3: Integrity + build + suite + visual** — checks then `lab.html#loaders` snapshot.
- [ ] **Step 4: Commit**

```bash
git add src/components/ui/skeleton.tsx src/lab/registry.tsx src/lab/effects.ts
git commit -m "feat(lab): convert Loaders (H) — shadcn Skeleton + kept bespoke states"
```

---

### Task 9: Family I (Glass) → reactbits GlassSurface / GlassIcons (FluidGlass EXCLUDED)

**Components:** reactbits **GlassSurface** + **GlassIcons** — both verified pure-React (`react`-only imports, no CSS companion) → **eager**, no `lazyKeys` change.

> **FluidGlass is EXCLUDED — do not fetch, install, or register it.** Verified via MCP: it imports `three`, `@react-three/fiber`, `@react-three/drei`, and `maath`. Per the project-wide three.js ban (Global Constraints / Task 4), `@react-three/fiber`'s global JSX augmentation collapses React 19 intrinsic elements to `never` across all of `src/` under `tsc -b` — `React.lazy` does NOT contain it. FluidGlass also needs `.glb` 3D models + demo `.webp` assets this project doesn't ship. There is no ogl glass substitute (unlike Task 4's LiquidChrome/Iridescence), so the third slot is filled by **keeping the live bespoke `gl-nav`** as the `current` reference — mirroring how Family H kept bespoke loaders alongside the one shadcn conversion. Net: 10 bespoke → 2 reactbits + 1 bespoke (catalog 65 → 58).

**Files:**
- Create: `src/components/reactbits/{GlassSurface,GlassIcons}.tsx`
- Modify: `src/lab/registry.tsx`, `src/lab/effects.ts`, `src/lab/Lab.tsx` (glass-scene wiring — see Step 3). `src/lab/lab.css` already has the `.glass-scene` backdrop (line ~373); no CSS change expected.

- [ ] **Step 1: Fetch sources** (ts-tailwind) → `src/components/reactbits/GlassSurface.tsx`, `GlassIcons.tsx`. Confirm each has a `export default`. Do NOT touch `lazyKeys` (both eager).
- [ ] **Step 2: Register** GlassSurface, GlassIcons (eager imports) in `registry.tsx`.
- [ ] **Step 3 (CRITICAL): wire library glass over the busy backdrop in `Lab.tsx`.** Today `Demo()` early-returns `<LibDemo>` for every non-bespoke specimen, so a reactbits glass panel would render on the plain `.spec__stage` with nothing behind it — and GlassSurface's whole effect is distorting its backdrop, so it'd look empty. Restructure `Demo()` so **glass is handled before the non-bespoke early return**, floating BOTH bespoke and library glass inside the existing `.glass-scene` (blobs + "Aa" glyph):

```tsx
function Demo({ kind, v }: { kind: Category['kind']; v: Variant }) {
  if (kind === 'glass') {
    return (
      <div className="glass-scene">
        <span className="glass-scene__blob a" />
        <span className="glass-scene__blob b" />
        <span className="glass-scene__txt">Aa</span>
        {v.source === 'bespoke'
          ? <div className={`glass ${v.cls ?? ''}`}>{v.name}<span>backdrop-filter</span></div>
          : <LibDemo v={v} />}
      </div>
    );
  }
  if (v.source !== 'bespoke') return <LibDemo v={v} />;
  // …existing switch; REMOVE the now-dead `case 'glass':` arm…
}
```

- [ ] **Step 4: Rewrite family I variants** in `effects.ts` (note `icon: '★'` is a string — `effects.ts` is pure data and can't build JSX; GlassIcons types `icon` as `ReactElement` but props is `unknown`-typed so it compiles, and React renders the glyph as a text node at runtime. Use `indigo`/`green` colors — both map to GlassIcons' gradient table; `teal` would render a flat color):

```ts
variants: [
  { code: c(1, 'GLS'), name: 'Glass surface', blurb: 'Frosted SVG-distortion panel.', source: 'reactbits', component: 'GlassSurface', install: 'reactbits: get GlassSurface (ts-tailwind)', siteTarget: 'Nav bar / lightbox', props: { width: 220, height: 96, borderRadius: 16, blur: 11, opacity: 0.9 }, label: 'backdrop-filter' },
  { code: c(2, 'GLS'), name: 'Glass icons', blurb: 'Glassy 3D icon tiles.', source: 'reactbits', component: 'GlassIcons', install: 'reactbits: get GlassIcons (ts-tailwind)', siteTarget: 'Socials row', props: { items: [{ icon: '★', color: 'indigo', label: 'GitHub' }, { icon: '✉', color: 'green', label: 'Email' }] } },
  { code: c(3, 'GLS'), name: 'Nav glass', blurb: 'rgba dark + blur(10px) — the live nav.', source: 'bespoke', cls: 'gl-nav', current: true },
],
```

- [ ] **Step 5: Integrity + build + suite + visual** — `npx vitest run src/lab/effects.test.ts`, `npm run build`, `npm test`, then ORCHESTRATOR Chrome gate on `lab.html#glass`:
  - GlassSurface (GLS·01) must visibly read as a frosted/refractive panel over the blobs. If Chromium silently no-ops `backdrop-filter: url(#filter)` distortion, bump `backgroundOpacity` to ~0.08–0.12 in effects.ts so the panel still reads as glass, and record it.
  - GlassIcons (GLS·02) renders 2 glassy tiles; watch sizing — its `gap-[5em]`/`py-[3em]` defaults are large and may overflow the 124px scene. Constrain via a `className` prop or defer fine sizing to Task 11 (self-contained overflow, same defer rule as MagicBento).
  - gl-nav (GLS·03) still shows its dark blurred panel + teal `is-current` ring.
- [ ] **Step 6: Commit**

```bash
git add src/components/reactbits src/lab/registry.tsx src/lab/effects.ts src/lab/Lab.tsx
git commit -m "feat(lab): convert Glass (I) to reactbits GlassSurface/GlassIcons (FluidGlass excluded — three.js)"
```

---

### Task 10: Lab shell wiring (filter + install-copy + metadata) + behaviors.ts trim

Surface the new wiring metadata in the UI and prune superseded JS behaviors. (Visual *aesthetics* are Task 11; this task is functional wiring + dead-logic removal.)

**Files:**
- Modify: `src/lab/Lab.tsx` (per-spec: show `component` + `siteTarget`, a **copy-install** affordance via the existing `copyCls` pattern; add a **source filter** — All / reactbits / shadcn / bespoke — to the rail; filter `cat.variants` before mapping)
- Modify: `src/lab/behaviors.ts` (remove handlers no longer referenced by any `source: 'bespoke'` specimen)
- Modify: `src/lab/effects.test.ts` (assert C + E stay bespoke)

- [ ] **Step 1: Add source filter + install-copy to `Lab.tsx`** — add `source` filter state (`'all' | 'reactbits' | 'shadcn' | 'bespoke'`, default `'all'`) + a rail segmented control mirroring the existing `bg`/`amb` controls. Compute `filtered = source==='all' ? cat.variants : cat.variants.filter(v => v.source === source)` per family; **skip rendering a family `<section>` entirely when its `filtered` list is empty** (no empty headers — the polished empty-state styling is Task 11). Leave the rail family counts as full totals for now (Task 11 refines). In each `.spec__meta`, when `v.source !== 'bespoke'`, render component + siteTarget + a copy button (this is functional wiring only — Task 11 restyles it):

```tsx
const copyInstall = (s?: string) => s && navigator.clipboard?.writeText(s);
// …in meta:
{v.install && (
  <span className="spec__cls" title="Copy install command" onClick={() => copyInstall(v.install)}>
    ⧉ {v.component} · {v.siteTarget}
  </span>
)}
```

- [ ] **Step 2: Trim the dead JS-behavior pipeline.** VERIFIED (`grep "data:" src/lab/effects.ts` → none): NO specimen emits `data-*` hooks anymore, so the ENTIRE `initBehaviors` function is dead (all 6 scanners: `magnetic`/`tilt`/`spotlight`/`ripple`/`stagger`/`scramble`). Remove the whole pipeline end-to-end:
  - `behaviors.ts`: delete `initBehaviors` and its 6 handler blocks; KEEP `initCursor` + `CursorMode` + the `Cleanup` type (rail-driven, still used).
  - `Lab.tsx`: drop `initBehaviors` from the import (keep `initCursor`/`CursorMode`), delete the `useEffect` that calls `initBehaviors`, delete the `da()` helper, the `const data = da(v.data)` line, and every `{...data}` spread in `Demo()`'s switch arms.
  - `effects.ts`: remove the now-unused `data?: Record<string, string>` field from the `Variant` interface (and its doc comment). If the build/tests flag `data` as referenced anywhere else, update that reference too.
  - Ensure no `noUnusedLocals`/`noUnusedParameters` violations after the trim.
- [ ] **Step 3: Add the C/E bespoke assertion** to `effects.test.ts`:

```ts
it('C (chips) and E (links) remain bespoke', () => {
  for (const id of ['chips', 'links']) {
    const cat = categories.find((c) => c.id === id)!;
    expect(cat.variants.every((v) => v.source === 'bespoke'), id).toBe(true);
  }
});
```

- [ ] **Step 4: Build + suite + visual** — `npm run build && npm test`; chrome-devtools: confirm source filter works, install-copy present, no console errors.
- [ ] **Step 5: Commit**

```bash
git add src/lab/Lab.tsx src/lab/behaviors.ts src/lab/effects.test.ts
git commit -m "feat(lab): source filter + install-copy metadata; trim superseded behaviors"
```

---

### Task 11: Lab *surface* UI/UX redesign

Give the bench a deliberate design pass (the user explicitly asked for this). The lab is dev-only, so anything used here never ships to production.

**DESIGN DIRECTION (decided — "instrument-grade specimen catalog"):** dark, brand-coherent teal/indigo, mono-forward technical labeling, a calm measured grid. The taxonomy (families A–I, codes like `BTN·04`, source tags) is treated as a real index, not decoration. **Signature element:** each specimen sits in a *measured vitrine* — a precise framed stage with faint low-opacity corner ticks + inset hairline — under a museum-style metadata plate carrying a colour-coded **source pill**. Family dividers carry a large ghosted family letter watermark. Spend the boldness on the vitrine + source-coding; keep everything else quiet.

**Token additions (lab-scoped, in `lab.css` `:root`, built on globals tokens):**
- spacing scale `--sp-1..6`: 4 / 8 / 12 / 16 / 24 / 40px
- `--lab-rail: 248px`; `--lab-panel: rgba(18,24,38,0.55)`; `--lab-line-soft: rgba(148,163,184,0.10)`
- source colours: `--src-reactbits: #5eead4` (teal) · `--src-shadcn: #818cf8` (indigo) · `--src-bespoke: #e0b170` (warm amber — distinguishes hand-made)
- type: hero h1 `clamp(30px,4.5vw,52px)`/800; family title 22px; specimen name 13.5px/600; blurb 12px; mono labels 10–11px (letter-spacing .08–.14em); code 10px mono.

**Three-zone layout** (replaces the all-in-rail layout):
```
┌──────────┬─────────────────────────────────────────┐
│  RAIL    │  STICKY FILTER TOOLBAR  (Source · N/58)  │  ← sticky top of canvas
│ (sticky, ├─────────────────────────────────────────┤
│  full-ht)│  HERO (thesis)                           │
│ brand+   │  ── A · CTA buttons ───────── ⟨ghost A⟩  │  ← family divider
│ conv.stat│   ┌vitrine┐ ┌vitrine┐ ┌vitrine┐          │
│ index A–I│   │ DEMO  │ │ DEMO  │ │ DEMO  │  cards    │
│ (mono +  │   │plate● │ │plate● │ │plate● │           │
│  counts) │   └───────┘ └───────┘ └───────┘          │
│ VIEW ctrl│                                          │
└──────────┴─────────────────────────────────────────┘
```
- **Rail:** brand + a one-line conversion stat; the family index (letter monogram · title · count, active-highlight kept via the existing IntersectionObserver); the **View** controls (Canvas / Ambient / Cursor / Reduced-motion) grouped under a label.
- **Sticky filter toolbar** (top of the canvas, `position: sticky; top: 0`): the **Source** segmented control + a live "showing N of 58" count. This is the always-reachable global toolbar.
- **Canvas:** hero, then family sections (dividers) and the vitrine grid.

**CSS keep/remove (verified against current `lab.css`):**
- **REMOVE (dead — families converted to libraries):** `.btn` + all `.bt-*` + `.ripple-ink` (A); `.ph`/`.port`/`.port__img` + all `.po-*` (B); `.card`/`.card__*` + all `.cd-*` (D); `.htxt` + all `.hd-*` + `.hd-stagger .ch` (F); `.bgtile` + all `.bg-*` incl `.bg-mesh`/`.bg-gridpan` (G — but KEEP the `.amb-*` ambient classes, still used by the rail control); `.ld-skeleton` + `@keyframes skeleton` (H — replaced by shadcn); `.gl-frost/.gl-vibrant/.gl-light/.gl-heavy/.gl-teal/.gl-noise(+::after)/.gl-specular/.gl-bright/.gl-dark` (I). Drop now-orphaned keyframes (`ringPulse`, `neonPulse`, `ripple`, `chipGlow`? keep—chips use it, `bounce`—chips use it, `glitchA/B`, `caret`, `charIn`, `aurora`?—ambient uses it, `progFill`—loader uses it). Verify each keyframe has a remaining user before deleting.
- **KEEP (still live):** `.cw`/`.chip`/`.ch-*` (C); `.lnk`/`.ln-*` (E); `.ld-ring`/`.ld-dots`/`.ld-bar`/`.ld-prog` (H); `.glass-scene*`/`.glass`/`.gl-nav` (I); `.cursor-dot`/`.cursor-ring`/`.trail-dot`/`.cursor-canvas` (cursor control); `.ambient`/`.amb-*` (ambient control); `.animate-star-movement-*` + their keyframes (StarBorder); `@property --p`; `.spec__stage:has(.glass-scene)` + `#backgrounds .spec__stage` sizing.
- **RENAME `.grid` → `.lab-grid`** (and update `Lab.tsx`) to kill the bare-class collision with reactbits components that use `grid` (the GlassIcons bug class). This generalises the fix; GLS·02's `!grid-cols-[auto_auto]` override can stay.

**`Lab.tsx` structural changes:**
- Move the **Source** control into a new sticky `.toolbar` at the top of the `.stage`; add the live "N of 58" count (sum of `filtered` lengths). Keep the other controls in the rail under a "View" group.
- Add a **source pill** to each `.spec__meta` (or as a badge): label = source, colour from `--src-*`. Keep JS/LIVE/current badges.
- **Lazy shimmer:** replace `<span className="spec__loading">loading…</span>` in `LibDemo`'s Suspense fallback with a CSS shimmer block sized to the stage (reuse the shadcn `Skeleton` or a `.spec__shimmer` pulse).
- **Empty state:** if every family filters to empty (defensive), render a centered empty-state message in the canvas.
- **Remove the dead "Replay all glares" control + `replayGlares()`** — no `.btn.glare` specimens remain. Keep `onStageMove` (spot canvas) and the cursor/rm effects.
- Update the footer string `explore/ui-effects-lab` → `explore/ui-lab-v2`.

**Per-kind stage sizing (fixes deferred overflow — tune in the Chrome gate):** consistent default stage ~`min-height: 120px`; give large library specimens room so nothing clips — **portraits** (ProfileCard ~388×540) and **cards** (MagicBento renders its full native bento) get a taller capped stage (`max-height` + `overflow: hidden`, centered) or a `transform: scale()` to fit; backgrounds keep their 160px; glass keeps 124px. The orchestrator will measure each kind in the gate and tune.

- [ ] **Step 1: Implement** the redesign in `lab.css` + `Lab.tsx` per the direction above — restyle shell/rail/toolbar/dividers/vitrine cards/states, remove the dead CSS, do the `.grid`→`.lab-grid` rename, add source pills + lazy shimmer + empty state, remove Replay-glares, update the footer string. No new deps required (a CSS shimmer is fine); shadcn `Skeleton` may be reused.
- [ ] **Step 2: Build + suite** — `npm run build && npm test` (no unused-var failures from the trim; 75 tests stay green — lab DOM isn't asserted by tests, so styling/markup changes are safe).
- [ ] **Step 3: ORCHESTRATOR Chrome gate across breakpoints** — walk every family at desktop; `resize_page` narrow and confirm the rail→top-bar reflow + grid reflow with nothing clipping; toggle the Source filter (incl. forcing an empty result), Reduced-motion, and a lazy WebGL specimen (shimmer → render); confirm source pills colour-code correctly and the vitrine/dividers read as intended. Fold visual fixes into the commit. No console errors.
- [ ] **Step 4: Commit**

```bash
git add src/lab/lab.css src/lab/Lab.tsx src/components/ui
git commit -m "feat(lab): redesign surface — instrument-grade catalog (vitrine cards, source pills, sticky toolbar, responsive)"
```

---

### Task 12: Docs + final verification gate

- [ ] **Step 1: Update `CLAUDE.md`** — the "Dev-only Interaction Lab" section: describe v2 (data + `registry.tsx` + copied reactbits sources in `src/components/reactbits/`, shadcn primitives in `src/components/ui/`, families F/G/D/A/B/H/I library-backed, C/E bespoke), note it now lives on `explore/ui-lab-v2`, still dev-only and **not** in the production build.
- [ ] **Step 2: Full gate** — `npm run build && npm test` (clean + all pass). Confirm `dist/` from the production build contains **no** reactbits/lab chunks (inspect `dist/assets/` — only the standard-site bundle).
- [ ] **Step 3: Whole-lab visual walk** — chrome-devtools: F, G, D, A, B, H, I render real components; C, E render bespoke; source filter, install-copy, reduced-motion, lazy shimmer all work; no console errors on any family.
- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: describe Interaction Lab v2 (library-backed, dev-only) on explore/ui-lab-v2"
```

---

## Self-Review

**Spec coverage (design + user changes → tasks):**
- Foundation on a **new branch off master** (not branch-reuse) + port shell → **Task 1** (done) ✓
- Pure-data schema + registry + integrity test → **Task 2** ✓
- Full conversion of F, G, D, A, B, H, I → **Tasks 3–9** (one per family) ✓
- Keep C chips + E links bespoke → enforced in Task 2 (`source:'bespoke'`) + asserted in **Task 10** ✓
- Lazy-load heavy/WebGL specimens → Global Constraints + **Tasks 4, 5, 9** (`lazyKeys`) ✓
- Replace `behaviors.ts` JS effects with reactbits → **Task 10** trim ✓
- "Pick → wire to site" manifest (install + siteTarget + copy button) → schema (Task 2) + **Task 10** UI ✓
- **Redesign the lab surface itself** (new user requirement) → **Task 11** (uses frontend-design) ✓
- Lab stays dev-only / production unaffected → Global Constraints + **Task 1** (verified) + **Task 12 Step 2** ✓
- Keep 70 tests green → asserted at every task boundary ✓

**Corrections folded in from foundation work:** branch is `explore/ui-lab-v2`; `src/components/ui/` is empty so **Task 6 must `add button`** (and Tasks 5/8 add card/skeleton); portrait asset is **`/portrait.svg`**; lab footer string updated in Task 11.

**Placeholder scan:** "fetch via `get_component_code`" steps are concrete tool calls (source content is tool-generated, like `npx shadcn add`), not TODOs. Prop objects are concrete with a stated reconcile-against-source rule. No "TBD"/"add error handling"/"similar to Task N" — each family task lists its own catalog + registry entries in full.

**Type consistency:** `LibDemo` (Task 3) reads `registry[v.component]` and spreads `v.props` — matching the Task 2 `Variant` fields (`component?`, `props?`). `lazyKeys` is defined in Task 2, extended (not renamed) in Tasks 4/5/9. The integrity test's field expectations (`source`/`component`/`install`/`siteTarget`) match the Task 2 interface. shadcn adapters (`ShadcnCard`/`ShadcnButton`/`ShadcnSkeleton`) are referenced in catalog `component:` strings and registered under the same keys.

**Open reconciliations (expected, handled at execution):** exact reactbits prop names per component (Global Constraints rule); whether MagicBento/FluidGlass pull heavy deps (import-scan steps handle lazy registration); whether `Waves` needs `ogl` (decide from fetched imports in Task 4).
