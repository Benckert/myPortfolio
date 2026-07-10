# Portfolio

[![CI](https://github.com/Benckert/myPortfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Benckert/myPortfolio/actions/workflows/ci.yml)

A personal developer portfolio with two modes:

- **Standard site** — an animated, single-page portfolio (default).
- **Terminal mode** — an interactive terminal (press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>K</kbd>,
  click `>_` in the nav, or open `#terminal`). Try `help`.

Built with React + Vite + TypeScript and Framer Motion.

## Make it yours

All content lives in **one file**: [`src/data/content.ts`](src/data/content.ts).
Edit your name, tagline, bio, projects, skills, experience, and social links
there — both the standard site and the terminal update automatically.

Add your resume by placing `resume.pdf` in `public/` (matches the default
`resumeUrl`).

**TODO — portrait photo:** `portraitUrl` still points at the `/portrait.svg`
placeholder. Use a **square** photo, at least **640×640** (it renders at 320px
on 2× displays), as **JPEG or WebP** under ~200 kB. Drop it in `public/` and
update `portraitUrl` in `content.ts`. For the social-card image (`og:image`
in `index.html`), use a separate **1200×630 PNG or JPEG** — crawlers don't
render SVG.

**TODO — project screenshots:** project cards are text-only today; a
thumbnail per project (add e.g. an `image` field to `Project` in
`content.ts`) is the planned next visual upgrade. Also update the `<title>`, description, and the Open Graph /
Twitter meta tags in `index.html` — including the `https://your-domain.example`
placeholders — so shared links render a proper card.

## Develop

```bash
npm install
npm run dev      # start the dev server
npm test         # run the test suite
npm run build    # type-check and build to dist/
npm run preview  # preview the production build
npm run smoke    # browser smoke test against the production build
```

Fonts are self-hosted (`@fontsource`), so no third-party requests at runtime.

## CI

`.github/workflows/ci.yml` runs the type-checked build, the unit tests, and
the Playwright smoke test (`scripts/smoke.mjs`) on every push to `master` and
every pull request. Locally, point the smoke test at a browser with
`PLAYWRIGHT_CHROMIUM_PATH` if you don't want it to download one
(`npx playwright install chromium`).

## Deploy

Static build — deploy `dist/` anywhere.

- **Vercel:** import the repo; framework preset **Vite**. `vercel.json` is included.
- **Netlify:** build `npm run build`, publish `dist`. `public/_redirects` handles SPA fallback.
- **GitHub Pages:** set `base: '/<repo-name>/'` in `vite.config.ts`, then deploy `dist/`.

## Terminal commands

`help` lists them all: `about`, `projects`, `skills`, `experience`, `contact`,
`resume`, `whoami`, `history`, `ls`, `cat <file>`, `open <slug>`, `echo`,
`clear`, `exit`. Tab completes; ↑/↓ recall history (persisted for the tab
session).
