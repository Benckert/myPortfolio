# Portfolio Effects v2 — Design

**Date:** 2026-06-27
**Branch:** `feat/portfolio-effects`
**Status:** Approved design (pending spec review)

## Goal

Add a coordinated set of motion/interaction effects to the standard site, focused on
the **home (hero)** and **contact** slides, plus two global layers (a persistent
background and click feedback) and a slide pager. Effects come from the already-vendored
reactbits components where possible; three are newly vendored. The dev-only Interaction
Lab is **out of scope** (and likely to be discarded later) — this work targets the real
site in `src/components/standard/`.

## Context

- The site is a 6-section snap deck: `main > section` with `scroll-snap-type: y mandatory`
  on `html` (`src/styles/globals.css`). Sections: `#home` (Hero), `#about`, `#projects`,
  `#experience`, `#skills`, `#contact`. Reduced-motion disables snapping.
- `src/data/content.ts` is the single source of truth (profile, projects, skills, socials).
- Reactbits components are vendored (`ts-tailwind`) in `src/components/reactbits/` and are
  shared (not lab-only). Present and relevant: `TiltedCard`, `StarBorder`, `SpotlightCard`,
  `TextType`. **Absent (must be vendored):** `ClickSpark`, `LogoLoop`. **Unavailable:**
  `LiquidEther` is not in the reactbits MCP registry — its source is fetched from the
  public reactbits repo.
- The portrait appears in **both** Hero and About, each as a `<button>` wrapping a
  `motion.img` with a shared `layoutId` that morphs into a `Lightbox` on click.

## Key technical findings

1. **LiquidEther is safe despite the three.js "ban".** The project bans three.js because
   `@react-three/fiber`'s global JSX augmentation collapses React 19 intrinsics to `never`
   under `tsc -b`. LiquidEther uses `import * as THREE from 'three'` **imperatively** inside
   `useEffect` (no `<Canvas>`/`<mesh>` JSX), so it never augments JSX and compiles cleanly.
   We add `three` as a runtime dependency and **lazy-load** the component so `three` is
   code-split out of the main bundle.
2. **TiltedCard builds its own `<img>`** from an `imageSrc` prop; it does not wrap children.
   Its internal image cannot carry the Framer `layoutId`, so combining it with the portrait
   means the lightbox **loses its shared-element morph** and instead opens with a fade-scale.
   **Decision (user-approved): take the tilt, accept the fade-scale lightbox.**
3. **StarBorder ships a fully-styled dark pill** (its own `from-black to-gray-900` gradient,
   border, padding, white text), not a bare border. Using it for the home CTA replaces that
   button's `.btn--ghost` look with StarBorder's pill + animated star glints. Acceptable;
   color is tuned to the teal accent and a hover glow is added.
4. **Dependency moves:** promote `motion` from devDependencies → dependencies (vendored
   reactbits import `motion/react`); add `three` to dependencies. `ogl` stays dev-only
   (LiquidChrome/Iridescence are not used). `framer-motion` is already a runtime dep.

## Architecture

### Shared background layer
A single `LiquidEther` canvas is mounted **once** (in `StandardSite`, above `main`) as a
fixed, full-viewport layer behind all content:

- Container: `position: fixed; inset: 0; z-index: -1; pointer-events: none;` at low opacity
  ("faint", default ~0.3, tunable 0.25–0.4), recolored to teal-accent hues via the `colors` prop.
- Sections remain transparent and snap-scroll **over** the fixed background → background is
  independent of the slides (as requested). The existing `.hero__aurora` is removed.
- Lazy-loaded via `React.lazy` + `Suspense` (fallback: nothing) so `three` is code-split.
- **Reduced-motion: render nothing** — no canvas, no WebGL, no battery cost. The site falls
  back to the existing dark `--bg`.

### New components (in `src/components/standard/`)
- **`SlidePager`** — fixed right-edge, vertically-centered prev/next chevron buttons,
  hidden until hover of that zone or keyboard focus. Uses `IntersectionObserver` to track
  the active section (query `main > section`), `scrollIntoView({ behavior })` to move; ▲
  hidden on first slide, ▼ on last. Real `<button>`s with `aria-label`. Reduced-motion →
  `behavior: 'auto'`. Coexists with `BackToTop` (user-approved: keep both).
- **`LiquidBackground`** — thin wrapper that lazy-loads `LiquidEther`, applies the fixed
  faint styling and accent colors, and renders nothing under reduced-motion.
- **`Spotlight`** (or inline on the CTA) — small cursor-follow radial highlight: tracks
  pointer with `--mx/--my` CSS vars on `mousemove`, paints a `radial-gradient` overlay.
  Applied to the "View my work" primary button.

### Newly vendored reactbits (in `src/components/reactbits/`)
- **`ClickSpark`** (deps: react + motion) — wraps the standard site once at the
  `StandardSite` root (scoped to the standard site, not the terminal overlay), accent-colored
  sparks on click, disabled under reduced-motion. The `LiquidBackground` is mounted in the
  same `StandardSite` root, above `main`.
- **`LogoLoop`** (deps: react + motion) — horizontal marquee at the hero bottom; fed a
  **curated set of ~6–8 inline tech SVGs** (monochrome, tinted muted/faint) to avoid adding
  a `react-icons` dependency. Paused/static under reduced-motion.

## Per-feature specification

| # | Feature | Where | Component | Notes |
|---|---------|-------|-----------|-------|
| 1 | Up/down slide nav | global (right edge) | new `SlidePager` | hover/focus-revealed; IO-tracked active section; reduced-motion instant |
| 2 | 3D tilt portraits | Hero + About | `TiltedCard` | click still opens `Lightbox` (fade-scale, no morph); tooltip "Click to enlarge"; mobile-warning off |
| 3 | Star-border CTA | Hero "Get in touch" | `StarBorder as="a"` | href `#contact`; teal color; hover box-shadow glow |
| 4 | Spotlight CTA | Hero "View my work" | bespoke `Spotlight` | cursor-follow radial over existing primary button |
| 5 | Bracketed links | Contact GitHub/LinkedIn | bespoke CSS | `[ ]` slide/fade in on hover **and** focus; accent tint |
| 6 | Typed name | Hero `<h1>` | `TextType` | types name once (no loop), caret; `<h1 aria-label={name}>` with animated span `aria-hidden`; reduced-motion → static |
| 7 | Click spark | global | `ClickSpark` (vendor) | wrap app once; accent sparks; disabled under reduced-motion |
| 8 | Logo loop | Hero bottom | `LogoLoop` (vendor) | curated inline tech SVGs; faint/muted; paused under reduced-motion |
| 9 | Faint liquid bg | global (fixed) | `LiquidEther` (vendor, lazy) | one fixed layer behind slides; teal; ~0.3 opacity; reduced-motion → none |

## Accessibility & motion

- **`usePrefersReducedMotion`** gates every effect: background renders nothing; pager jumps
  instantly; logo loop is static; click spark is disabled; typed name is static; tilt falls
  back to a plain image (TiltedCard's transforms are spring-driven and effectively inert
  without pointer movement, but we also reduce/skip `scaleOnHover` under reduced-motion).
- Hero name keeps a real `<h1>` with `aria-label` = full name; the typing span is
  `aria-hidden` so screen readers announce the name once, not character-by-character.
- `SlidePager` buttons are keyboard-focusable (so they appear on focus) with clear
  `aria-label`s ("Next section" / "Previous section").
- Bracketed contact links react to `:focus`/`:focus-within`, not only `:hover`.
- Preserve existing a11y guarantees (skip-link, focus management, terminal focus restore).

## Testing

- Unit/component tests (Vitest + Testing Library, jsdom) for each new interactive piece:
  `SlidePager` (renders buttons, hides ▲ on first / ▼ on last, calls scroll on click),
  `LiquidBackground` (renders nothing under reduced-motion), typed-name a11y (`<h1>` has
  accessible name = profile name), bracketed links (present + reach focus).
- Reduced-motion assertions via the existing `matchMedia` override pattern in
  `src/test/setup.ts`.
- Content-driven tests (`sections.test.tsx`, etc.) must stay green.
- **Gates:** `npm run build` (tsc type-check) and `npm test` must pass.
- **Browser verification** (project rule: reactbits ts-tailwind ports render broken despite
  green builds — always browser-gate): visually verify LiquidEther, LogoLoop, ClickSpark,
  TiltedCard, StarBorder in Chrome before merge.

## Out of scope / deferred

- The dev-only Interaction Lab (`src/lab/`) — untouched; likely discarded in a later pass.
- LiquidChrome/Iridescence/`ogl` — not used (LiquidEther chosen instead).
- Adding project-card images / applying TiltedCard to project thumbnails (portraits only).
- Migrating the whole site off `framer-motion` to `motion` (both coexist for now).

## Risks

- **Bundle size:** `three` is sizeable. Mitigated by lazy-loading + code-splitting and by
  the reduced-motion path skipping it entirely.
- **WebGL perf/battery:** one always-running fluid sim. Mitigated by low `resolution`, faint
  opacity, and reduced-motion opt-out. Re-evaluate if it's heavy on lower-end hardware.
- **Visual cohesion:** StarBorder's dark pill differs from the site's button system; tune
  color/glow and verify it reads as intentional next to the spotlight primary CTA.
- **reactbits port breakage:** per project memory, fetched ts-tailwind components can render
  broken despite a clean build — browser-gate the three newly-vendored/used effects.
