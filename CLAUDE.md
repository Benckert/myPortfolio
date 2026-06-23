# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server (serves index.html; lab at /lab.html)
npm run build        # tsc -b (type-check) then vite build → dist/
npm test             # vitest run (one-shot, used for CI/verification)
npm run test:watch   # vitest in watch mode
npm run preview      # serve the production build from dist/
```

Run a single test file or filter by name:

```bash
npx vitest run src/lib/commands.test.ts      # one file
npx vitest run -t "Tab completes"            # by test name substring
```

`npm run build` is the type-check gate — there is no separate lint step. TypeScript runs in `strict` mode with `noUnusedLocals`/`noUnusedParameters`, so unused vars fail the build.

Add shadcn/ui components with `npx shadcn@latest add <name>` — they land in `src/components/ui/`. The `shadcn` and `reactbits` MCP servers are configured for browsing/scaffolding components.

## Architecture

A single-page React 19 + Vite + TypeScript portfolio with **two interchangeable modes** rendered by `App.tsx`: the `StandardSite` (always mounted) and a `Terminal` overlay (mounted only when `mode === 'terminal'`). `useMode` (`src/lib/useMode.ts`) owns mode state and persists it via `localStorage` + the `#terminal` URL hash; Ctrl/Cmd+K opens the terminal, Escape closes it.

Three architectural ideas tie the codebase together:

1. **`src/data/content.ts` is the single source of truth.** It exports one typed `content` object (profile, projects, skills, experience, education, socials). Both the standard site sections *and* the terminal read from it — there is no second copy of the data. Editing this file is how you "make the portfolio yours." When adding fields, update the interfaces at the top of the same file.

2. **The terminal is a command registry over a virtual filesystem.** Commands self-register into the `registry` map in `src/lib/commands.ts` via `register({ name, description, handler })`. `help`, the `commandNames` list, Tab-completion, and "did you mean…" suggestions (`suggest.ts`, Levenshtein) all derive from that map — so adding a command means one `register(...)` call and nothing else. `vfs.ts` maps `content` onto fake files (`about.txt`, `projects/<slug>.md`, …) that `ls`/`cat` traverse. `useTerminal.ts` is the stateful hook driving scrollback, command history (↑/↓), and Tab completion (longest-common-prefix); the `Terminal` component is presentation only.

3. **Styling is hand-written CSS tokens, with Tailwind v4 layered on for shadcn/ui.** The foundation is plain CSS: design tokens (color, spacing, motion) live as CSS custom properties in `src/styles/globals.css`, and component styles sit in co-located `.css` files (`standard.css`, `terminal.css`). Tailwind v4 (`@tailwindcss/vite`, imported at the top of `globals.css`) is enabled so **shadcn/ui** components render. **Critical:** the two systems share variable names, so they're kept in separate namespaces. The *bare* tokens (`--muted`, `--accent`, `--border`, …) keep their original meaning for the hand-written CSS — here `--muted` is a *text* color and `--accent` is the *brand teal*, **not** shadcn's background roles. shadcn components consume the **`--color-*`** namespace, which `globals.css` maps onto the bare tokens via `@theme inline`. So: never redefine a bare token to shadcn's semantics, and add new theme colors through `@theme inline` (`--color-*`), not by overwriting `--muted`/`--accent`. The site is dark-only (`<html class="dark">`). The `@/` import alias maps to `src/` (wired in `vite.config.ts` + both `tsconfig`s); the `cn()` class merger lives in `src/lib/utils.ts`.

### Components

- `src/components/standard/` — the marketing site: `StandardSite` composes `Nav → Hero → About → Projects → Experience → Skills → Contact → Footer` plus `BackToTop`. Section order is asserted by `site-order.test.tsx`.
- `src/components/terminal/` — `Terminal`, `TerminalOutput` (renders typed `OutputLine[]`), `CommandChips`.
- `src/components/ui/` — shadcn/ui primitives (generated; e.g. `button.tsx`). Tailwind-classed, themed via the `--color-*` bridge above.
- `src/lib/` — non-React logic: `commands`, `vfs`, `suggest`, `useTerminal`, `useMode`, `motion`, `types`, `utils` (`cn`).

### Motion & accessibility

Animations use Framer Motion with shared variants in `src/lib/motion.ts` (`fadeUp`, `staggerContainer`) and a `useScrollReveal` hook wrapping `useInView`. Respect `usePrefersReducedMotion` — reduced-motion users must get a static experience. Accessibility is tested (`a11y.test.tsx`), so preserve focus management (terminal restores focus on exit), the skip-link, and ARIA labels.

### Dev-only Interaction Lab

`src/lab/` (`Lab.tsx`, `effects.ts`, `behaviors.ts`) is a data-driven specimen bench for tuning hover/animation effects, served at `/lab.html` during `npm run dev`. It is **not** part of the production build (`vite build` only bundles `index.html`) and lives only on the `explore/ui-effects-lab` branch.

## Testing conventions

Vitest + Testing Library in a jsdom environment (`vite.config.ts`, `globals: true`). `src/test/setup.ts` stubs `matchMedia` and `IntersectionObserver` (jsdom lacks both) so motion/scroll-reveal components render — individual tests may override `window.matchMedia` to assert reduced-motion behavior. Tests are co-located as `*.test.ts(x)`. Content-driven tests (e.g. `sections.test.tsx`, `commands.content.test.ts`) iterate over the real `content` object, so they keep passing when you edit `content.ts`.

## Styling migration — in progress (follow-up)

Tailwind v4 + shadcn were adopted on top of the existing hand-written CSS; the two **coexist** (see Architecture point 3). The existing components (`standard/`, `terminal/`) are **not yet** migrated to Tailwind utilities and still use their co-located `.css` files. Intended direction:

- **New UI** → Tailwind utilities + shadcn primitives.
- **Existing components** → migrate **incrementally**, only when you're already editing one (strangler pattern). A big-bang rewrite of `standard.css`/`terminal.css`/`lab.css` is deliberately deferred — those files use fluid `clamp()` typography, scroll-snap paging math, and keyframes that Tailwind expresses awkwardly, and a full rewrite is high-risk for a working, tested site with little functional payoff. Keep the design-token bridge as the shared source of truth.

## Repo notes

- The default/integration branch is **`master`** (there is no `main` and no configured remote). Do feature work on a branch, then merge to `master`.
- Deploy is a static `dist/` build. SPA fallback rewrites are configured for Vercel (`vercel.json`) and Netlify (`public/_redirects`).
