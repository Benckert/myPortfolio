# Portfolio

A personal developer portfolio with two modes:

- **Standard site** — an animated, single-page portfolio (default).
- **Terminal mode** — an interactive terminal (press the backtick `` ` `` key,
  click `>_` in the nav, or open `#terminal`). Try `help`.

Built with React + Vite + TypeScript and Framer Motion.

## Make it yours

All content lives in **one file**: [`src/data/content.ts`](src/data/content.ts).
Edit your name, tagline, bio, projects, skills, experience, and social links
there — both the standard site and the terminal update automatically.

Add your resume by placing `resume.pdf` in `public/` (matches the default
`resumeUrl`).

## Develop

```bash
npm install
npm run dev      # start the dev server
npm test         # run the test suite
npm run build    # type-check and build to dist/
npm run preview  # preview the production build
```

## Deploy

Static build — deploy `dist/` anywhere.

- **Vercel:** import the repo; framework preset **Vite**. `vercel.json` is included.
- **Netlify:** build `npm run build`, publish `dist`. `public/_redirects` handles SPA fallback.
- **GitHub Pages:** set `base: '/<repo-name>/'` in `vite.config.ts`, then deploy `dist/`.

## Terminal commands

`help` lists them all: `about`, `projects`, `skills`, `experience`, `contact`,
`resume`, `whoami`, `ls`, `cat <file>`, `open <slug>`, `echo`, `clear`, `exit`.
Tab completes; ↑/↓ recall history.
