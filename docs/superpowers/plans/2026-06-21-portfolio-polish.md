# Portfolio Polish — Implementation Spec

Branch: `feat/portfolio-polish` (off `master`). Merges back to `master`.

## Context

A finished React 19 + Vite + TypeScript portfolio. Two modes share one source
of truth (`src/data/content.ts`): a standard animated site (`StandardSite`) and
a full-screen terminal overlay (`Terminal`). Styling is plain CSS with custom
properties in `src/styles/globals.css` (tokens) and
`src/components/standard/standard.css`; the terminal has its own
`src/components/terminal/terminal.css`. Tests: Vitest 4 + React Testing Library;
setup stubs `matchMedia` and `IntersectionObserver` in `src/test/setup.ts`.
Motion respects `prefers-reduced-motion` via
`src/hooks/usePrefersReducedMotion.ts`.

## Global Constraints (bind every task)

- **`src/data/content.ts` is the single source of truth.** Any new user-editable
  content (image paths, etc.) MUST be a field there, read by components — never a
  hard-coded path inside a component.
- TDD: write a failing test, see it fail, implement, see it pass. Commit per
  concern (atomic commits), not one giant commit.
- `npm test` (all suites) and `npm run build` (tsc + vite) MUST be green before
  every commit. Run them; paste real output in your report.
- Respect `prefers-reduced-motion` for any new motion/scroll behavior (read it
  via the existing `usePrefersReducedMotion` hook; do not re-implement).
- Accessibility: every interactive element has an accessible name
  (`aria-label` or visible text); images have meaningful `alt`.
- Match the existing code style: functional components, named exports, CSS class
  naming already in the files (BEM-ish: `block__element--modifier`), design
  tokens (`var(--accent)`, `var(--border)`, etc.) — no new hard-coded colors
  where a token exists.
- Do NOT touch `main`/`master` directly; you are on `feat/portfolio-polish`.
- Do not add dependencies. Framer Motion, React, and the existing hooks are
  available; pure CSS is preferred for simple transitions.
- jsdom cannot compute applied stylesheets — do NOT write tests asserting CSS
  outline/border/scroll-snap values. CSS-only changes are verified by review +
  manual screenshot, not unit tests. Note such changes in your report.

---

## Task 1 — Standard-site visual additions (portrait, back-to-top, section snapping)

Touches only the standard site + global tokens. Files: `src/data/content.ts`,
`src/components/standard/Hero.tsx`, `src/components/standard/About.tsx`,
`src/components/standard/StandardSite.tsx`,
`src/components/standard/standard.css`, `src/styles/globals.css`,
`public/portrait.svg` (new), `src/components/standard/BackToTop.tsx` (new) +
its test, plus updates to `Hero.test.tsx`. Do NOT modify terminal files,
`useMode.ts`, `ModeToggle.tsx`, or `README.md` (those are Task 2).

### 1a. Portrait image, editable from `content.ts`

- In `src/data/content.ts`: add `portraitUrl?: string;` to the `profile`
  interface (place it after `resumeUrl?`). In the `content` object set
  `portraitUrl: '/portrait.svg',`.
- Create `public/portrait.svg`: a tasteful placeholder avatar (NOT a stock
  silhouette clipart). A clean geometric/abstract portrait placeholder using the
  site palette — e.g. a rounded square or circle background with the site
  gradient (teal `#5eead4` → indigo `#818cf8`) and a simple abstract
  head-and-shoulders glyph or the user's monogram. Square viewBox (e.g.
  `0 0 400 400`). It must look intentional as a placeholder.
- **Hero** (`Hero.tsx`): render the portrait as a circular image alongside the
  intro text. Make `.hero__inner` a two-column layout on wide screens (text
  left, portrait right); single column on narrow screens (portrait above text,
  smaller). Read the src from `content.profile.portraitUrl`; render the `<img>`
  only if it is set. `alt={`Portrait of ${name}`}`. This image is above the
  fold — do not lazy-load it. Give it explicit width/height (or aspect-ratio) to
  avoid layout shift. The portrait may have a subtle entrance animation
  consistent with the existing hero motion (gated by `usePrefersReducedMotion`),
  or none — your call, keep it tasteful.
- **About** (`About.tsx`): render the same portrait beside the bio — two-column
  on wide screens (bio + portrait), stacked on narrow. `loading="lazy"` here
  (below the fold). Same `alt`. Render only if `portraitUrl` set.
- CSS for both lives in `standard.css` (new classes like `.hero__portrait`,
  `.about__layout` / `.about__portrait`). Circular or softly-rounded; sized
  responsively; respects the existing `--maxw` container.

Tests:
- Update `Hero.test.tsx` if needed so it still passes; add an assertion that an
  image with accessible name matching the profile name is present
  (`screen.getByRole('img', { name: new RegExp(content.profile.name, 'i') })`).
- Add to (or create) an About test asserting the portrait `<img>` renders with
  the profile-name alt. (There is no `About.test.tsx` yet — create one, mirror
  the import style of `Hero.test.tsx`.)

### 1b. Back-to-top button

- New component `src/components/standard/BackToTop.tsx`. A fixed
  bottom-right button with an upward chevron/arrow (inline SVG, `aria-hidden`),
  `aria-label="Back to top"`, class `back-to-top`.
- Hidden until the user scrolls down past a threshold (use `400` px of
  `window.scrollY`). Use React state toggled by a `scroll` listener (throttle
  with `requestAnimationFrame`); add/remove a `back-to-top--visible` class. Clean
  up the listener on unmount.
- On click: scroll to top. Read `usePrefersReducedMotion()`; call
  `window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })`.
- Visibility transition is pure CSS (opacity/transform on the `--visible` class)
  in `standard.css`. Style it to match the site (token colors, `--radius`,
  subtle shadow); ensure it has a visible focus state (the global
  `:focus-visible` applies) and adequate tap-target size (~44px).
- Mount `<BackToTop />` inside `StandardSite` (after `<Footer />`, still inside
  the fragment). It only exists on the standard site, which is correct.

Tests (`BackToTop.test.tsx`):
- Initially the button is NOT visible (assert it lacks the `--visible` class, or
  is not in the document if you choose conditional render — pick one approach and
  test it). Note: jsdom has no real layout; set `window.scrollY` and dispatch a
  `scroll` event inside `act()` to drive the threshold. If you use
  `requestAnimationFrame`, the test must flush it (e.g. mock `rAF` to run
  synchronously, or `await` a tick) — make the test deterministic.
- After scrolling past threshold, the button becomes visible.
- Clicking it calls `window.scrollTo` with `top: 0`. jsdom does not implement
  `window.scrollTo` — assign `window.scrollTo = vi.fn()` in the test and assert
  the call. (Default `matchMedia` stub → motion allowed → `behavior: 'smooth'`.)

### 1c. Section scroll-snapping (slight)

- In `globals.css`, on the document scroller (`html`): add
  `scroll-snap-type: y proximity;` and `scroll-padding-top: 64px;` (64px = the
  sticky nav height, so snapped sections and anchor jumps clear the nav).
  Keep the existing `scroll-behavior: smooth`.
- Add `main > section { scroll-snap-align: start; }` (every standard-site
  section root is a direct `<section>` child of `<main>`, verified).
- Use `proximity` (gentle — only snaps when the user stops near a snap point),
  NOT `mandatory` (which can trap scrolling). This is intentional per the
  "slight snapping" requirement.
- CSS-only — no test (see global constraints). Confirm `npm run build` passes
  and note the change in your report.

---

## Task 2 — Terminal & shortcut interactions (Ctrl/Cmd+K, focus border, window dots)

Touches only the terminal + shortcut + docs. Files: `src/lib/useMode.ts` +
`src/lib/useMode.test.ts`, `src/components/terminal/Terminal.tsx` +
`src/components/terminal/Terminal.test.tsx`,
`src/components/terminal/terminal.css`,
`src/components/standard/Hero.tsx`,
`src/components/shared/ModeToggle.tsx`, `README.md`. Do NOT touch
`content.ts`, `About.tsx`, `StandardSite.tsx`, `globals.css`, or
`standard.css` beyond the single Hero hint copy change described in 2a.

### 2a. Replace backtick shortcut with Ctrl/Cmd + K (layout-agnostic)

Why: backtick is a dead key on Nordic/ISO keyboards (the user's case) and is
not a standard "open terminal/command" chord. `Ctrl/Cmd + K` is the widely
recognized command-palette shortcut and uses a letter key (`e.key === 'k'`),
which is consistent across keyboard layouts.

- In `src/lib/useMode.ts`, replace the keydown handler logic:
  - Open the terminal when `(e.metaKey || e.ctrlKey)` AND
    `e.key.toLowerCase() === 'k'`. Call `e.preventDefault()` then `open()`.
  - Keep: `Escape` calls `close()`.
  - Remove the now-unneeded `typing`/INPUT-TEXTAREA guard (the chord is
    deliberate; it should work even when an input is focused). Update the
    stale `// backtick opens` comment.
- Visible hint copy in `Hero.tsx`: replace the backtick hint. Show the chord in
  keycaps. Pick the modifier label by platform with an inline check
  `const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);`
  → label `'⌘'` if mac else `'Ctrl'`. Render e.g.
  `psst — press <kbd class="hero__hint-key">{mod}</kbd> <kbd class="hero__hint-key">K</kbd> for terminal mode`.
  Keep the substring "terminal mode" in the button's accessible name (an existing
  test matches `/terminal mode/i`). Reuse the existing `.hero__hint-key` style
  (it can style `<kbd>` too — adjust the selector in `standard.css` ONLY if
  needed to cover `kbd.hero__hint-key`; this is the one allowed standard.css
  edit in Task 2).
- `ModeToggle.tsx` aria-label: change "(or press the backtick key)" →
  "(or press Ctrl/Cmd + K)".
- `README.md` line 6: change "press the backtick `` ` `` key" →
  "press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>K</kbd>".

Tests (`useMode.test.ts`): add cases —
- Dispatching `new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })` on
  `window` (inside `act`) sets mode to `'terminal'`.
- Same with `{ key: 'k', metaKey: true }` sets mode to `'terminal'`.
- (Sanity) a plain `` ` `` keydown does NOT open the terminal anymore.
- `Escape` still returns to standard (open first, then dispatch Escape).
Use `renderHook(() => useMode())` and `act(() => window.dispatchEvent(...))`,
mirroring the existing test file's style.

### 2b. Remove the focus border on the terminal input

The global `:focus-visible { outline: 2px solid var(--accent) }` wins over
`.term-input`'s base `outline: none` on focus, drawing a ring. The terminal
input is the only focus target in a full-screen dialog and shows a blinking
`caret-color` as its focus affordance, so removing the ring here is acceptable.

- In `terminal.css` add a higher-specificity rule:
  `.term-input:focus, .term-input:focus-visible { outline: none; box-shadow: none; }`
- CSS-only — no test. Note it in your report.

### 2c. macOS window-control dots become functional

Decisions (already agreed with the user): **red = close, green = zoom
(toggle windowed/full-screen), yellow = minimize (to a restore chip).**

In `Terminal.tsx`:
- Convert the three decorative `<span className="term-dot ...">` into real
  `<button>` elements (keep the dot classes for color). Each needs
  `type="button"` and an accessible name:
  - Red (`term-dot--red`): `aria-label="Close terminal"`, `onClick={onExit}`.
  - Green (`term-dot--green`): `aria-label="Zoom terminal"` (toggle), with
    `aria-pressed={windowed}`; `onClick` toggles a `windowed` state.
  - Yellow (`term-dot--amber`): `aria-label="Minimize terminal"`; `onClick`
    sets a `minimized` state.
- Remove the now-redundant `✕` close button (`.term-close` JSX) since red closes;
  remove its CSS rule too.
- **Zoom (green):** `const [windowed, setWindowed] = useState(false)`. When true,
  add a `term-root--windowed` modifier class to the root. In `terminal.css`,
  `.term-root--windowed` constrains the terminal to a centered window (max-width
  ~900px, max-height ~80vh, margin auto, `border-radius`, a border using
  `--border`, and a backdrop so the page dims behind — e.g. the root keeps its
  fixed inset but centers a windowed panel; simplest: keep `.term-root` fixed
  full-bleed as a dimmed backdrop and constrain the inner column when windowed).
  Implement cleanly; the toggle must visibly change size and `aria-pressed`.
- **Minimize (yellow):** `const [minimized, setMinimized] = useState(false)`.
  When true, hide the main terminal UI (bar + screen + chips) and render a small
  restore "chip" button (class `term-restore`) — a pill showing
  `visitor@portfolio:~` (and a restore icon) with
  `aria-label="Restore terminal"`. Clicking the chip sets `minimized=false` and
  refocuses the input. Keep terminal state (scrollback) intact across
  minimize/restore — hide via conditional render of the body while keeping the
  `Terminal` component mounted; do NOT call `onExit`. Style `.term-restore` in
  `terminal.css` (fixed, bottom area, token colors, mono font).
- Keep the existing `term-title`, intro, scrollback, input, `CommandChips`, and
  all existing keyboard handling (Enter/Arrows/Tab/Escape) unchanged.
- Optional nicety (only if quick & clean): on hover, reveal the classic glyphs
  (× / – / +) on the dots via CSS `::before`. Skip if it risks the tests.

Tests (`Terminal.test.tsx`): keep existing two tests passing; add —
- Red dot: `getByRole('button', { name: /close terminal/i })` click → `onExit`
  called. (The `exit` command test stays.)
- Green dot: click `getByRole('button', { name: /zoom terminal/i })` → its
  `aria-pressed` becomes `"true"` (toggle).
- Yellow dot: click `getByRole('button', { name: /minimize terminal/i })` →
  a restore control appears (`getByRole('button', { name: /restore terminal/i })`)
  and the terminal input is no longer rendered; clicking restore brings the
  input back (`getByRole('textbox', { name: /terminal input/i })`).

---

## Out of scope (product-level, the user does these)

Editing `content.ts` with real info; adding `public/resume.pdf`; supplying a
real portrait file (the placeholder `public/portrait.svg` is what we ship).
