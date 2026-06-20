# Developer Portfolio — Design Spec

**Date:** 2026-06-21
**Status:** Approved (design), pending implementation plan

## 1. Purpose & Context

A modern personal portfolio for a newly-qualified web developer whose strongest
material is **personal projects** (limited professional experience beyond
internships). The site must read as polished and recruiter-friendly while
showing genuine front-end craft.

Signature feature: an **interactive terminal mode** as a memorable gimmick,
alongside a conventional, animation-rich **standard site**. Both modes are
first-class; the standard site is the default so non-technical recruiters are
never blocked by the gimmick.

### Success criteria
- A recruiter landing cold sees a professional portfolio with clear projects,
  skills, and contact info — no friction.
- A curious/technical visitor can launch a believable terminal and navigate the
  same content via commands.
- The owner can update **all** of their content by editing **one** file.
- Lighthouse-respectable: accessible, responsive, fast, motion-safe.

## 2. Decisions (locked)

| Decision | Choice |
|---|---|
| Build tooling | **React + Vite + TypeScript** |
| Mode architecture | Standard site default; **terminal as full-screen overlay toggle** |
| Standard aesthetic | Experimental, animation-rich, "stand out" |
| Terminal aesthetic | Authentic, familiar terminal look & feel |
| Terminal scope | Portfolio commands **+ Unix classics** (history, tab-completion, easter eggs) |
| Contact | **Links only** (email + socials), no backend |
| Content strategy | **Scaffold with placeholders** in one central data file |
| Animation library | **Framer Motion** |
| Standard layout | **Single-page scroll** with sticky nav |
| Deployment | Static build → Vercel / Netlify / GitHub Pages |

## 3. Architecture

Single-page React app. Two modes render over one shared, typed dataset.

```
src/
  data/content.ts          # SINGLE SOURCE OF TRUTH — owner edits only this
  App.tsx                  # mode state (standard | terminal), URL hash sync
  main.tsx
  components/
    standard/
      Nav.tsx
      Hero.tsx
      About.tsx
      Projects.tsx
      ProjectCard.tsx
      Skills.tsx
      Experience.tsx        # internships timeline
      Contact.tsx
      Footer.tsx
    terminal/
      Terminal.tsx          # the overlay (input + scrollback)
      TerminalOutput.tsx    # renders a single output block
      CommandChips.tsx      # tappable commands for mobile
    shared/
      ModeToggle.tsx        # floating >_ button
  lib/
    commands.ts             # command registry: name -> handler(args, ctx)
    useTerminal.ts          # input buffer, history, tab-completion, dispatch
    motion.ts               # shared variants + reduced-motion helpers
  hooks/
    useScrollReveal.ts
    usePrefersReducedMotion.ts
  styles/
    globals.css
```

### Mode state & toggle
- `App` owns `mode: 'standard' | 'terminal'`.
- Opened via floating `>_` button **or** the `` ` `` (backtick) key.
- Closed via `Esc` or the terminal `exit` command.
- Mode mirrored to the URL hash (`#terminal`) so the terminal is shareable, and
  persisted to `localStorage` so the last-used mode is restored.
- A subtle hint near the hero ("press \` for terminal mode") surfaces the
  feature so it is discoverable.

## 4. Content model (`src/data/content.ts`)

One typed object; every section and every command reads from it.

```ts
export interface Project {
  slug: string;
  name: string;
  summary: string;        // one line, used in cards & `projects`
  description: string;    // longer, used in `cat projects/<slug>`
  stack: string[];
  highlights: string[];
  live?: string;
  repo?: string;
}

export interface Experience {
  role: string;
  org: string;
  period: string;
  points: string[];
}

export interface Content {
  profile: {
    name: string;
    tagline: string;
    bio: string;
    location?: string;
    resumeUrl?: string;
  };
  socials: { github?: string; linkedin?: string; email: string; [k: string]: string | undefined };
  projects: Project[];
  skills: { languages: string[]; frameworks: string[]; tools: string[] };
  experience: Experience[];
}
```

Ships with clearly-marked placeholder values (e.g. `name: 'Your Name'`) so the
site runs immediately and the owner can find/replace.

## 5. Terminal mode

### Command interpreter
`lib/commands.ts` exports a registry: `Record<string, CommandHandler>` where a
handler has signature `(args: string[], ctx: CommandContext) => OutputLine[]`.
`CommandContext` exposes the content data and control actions (e.g. `clear`,
`exit`, `openUrl`). Pure logic — no DOM — so it is unit-testable in isolation.

### Commands
| Command | Behavior |
|---|---|
| `help` | List available commands with one-line descriptions |
| `about` | Profile bio + tagline |
| `projects` | List projects (name + summary) |
| `skills` | Grouped skills (languages / frameworks / tools) |
| `experience` | Internship history |
| `contact` | Email + social links |
| `resume` | Link to / open resume |
| `whoami` | `visitor` flavor line |
| `ls [dir]` | List virtual files: `about.txt skills.txt projects/ resume.pdf` |
| `cat <file>` | Print a virtual file's contents from `content.ts` |
| `open <slug>` | Open a project's live/repo link in a new tab |
| `echo <text>` | Echo input |
| `history` | Show command history |
| `clear` | Clear scrollback |
| `social` | Social links |
| `exit` | Return to standard site |
| `sudo …` | Easter egg — cheeky permission-denied message |

Unknown commands return a "command not found" line with a nearest-match
suggestion.

### Behavior & feel
- Command **history** via ↑/↓; **tab-completion** for command names and (after a
  command that takes a file) virtual filenames.
- Authentic styling: monospace, colored prompt `visitor@portfolio:~$`, blinking
  caret, brief typewriter intro banner on first open.
- Auto-scroll scrollback to newest output; input always focused while open.

### Mobile
Typing on phones is awkward, so the terminal renders a row of tappable
**command chips** (`help`, `projects`, `skills`, `contact`, `exit`) that inject
the command on tap. The terminal remains fully usable without a keyboard.

## 6. Standard site

Single-page vertical scroll, sticky translucent nav with smooth-scroll anchors.

| Section | Notes |
|---|---|
| Hero | Animated aurora/gradient background, typewriter tagline, magnetic CTA buttons, terminal hint |
| About | Short bio, portrait/avatar slot |
| Projects | Scroll-reveal cards, hover tilt/glow, stack tag chips, live/repo links |
| Skills | Grouped, staggered reveal |
| Experience | Internship timeline |
| Contact | Email + social links (no form) |
| Footer | Copyright, "built with" note, back-to-top |

**Animation:** Framer Motion for entrance and scroll-reveal animations plus a
few signature effects (gradient hero, typewriter, magnetic buttons, card
tilt). All effects are gated behind `prefers-reduced-motion` and degrade to
instant/no-motion.

## 7. Accessibility & responsiveness

- Semantic landmarks (`header`/`nav`/`main`/`section`/`footer`), heading order.
- Keyboard navigable; visible focus states; terminal trap-focuses while open and
  restores focus to the toggle on close.
- Color contrast checked against WCAG AA.
- **`prefers-reduced-motion` honored globally** via `usePrefersReducedMotion`.
- Responsive from ~320px up; terminal uses command chips on small screens.

## 8. Testing

- **Vitest + React Testing Library.**
- Primary focus: the command interpreter (`commands.ts` / `useTerminal.ts`) —
  parsing, unknown-command handling + suggestions, history navigation,
  tab-completion, and each command's output. Built test-first.
- Lighter component smoke tests for terminal rendering and that standard
  sections render content from `content.ts`.

## 9. Deployment

- `vite build` → static `dist/`.
- Targets: Vercel / Netlify / GitHub Pages. Include config (e.g. SPA fallback /
  base path note for GH Pages) and a README covering local dev, editing
  `content.ts`, and deploying.

## 10. Out of scope (YAGNI)

- No CMS, no backend, no contact-form server.
- No blog/MDX system (can be a later milestone).
- No i18n, no analytics (can be added later).
- No multi-page routing — single page + overlay only.
