# Developer Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React + Vite + TypeScript personal portfolio with an animation-rich standard site (default) and an authentic interactive terminal mode (toggle), both reading from a single content file.

**Architecture:** Single-page app. `App` holds a `mode` state (`standard | terminal`). The standard site is a vertical-scroll page of presentational sections. The terminal is a full-screen overlay backed by a pure command interpreter. Both modes read from one typed `content.ts`. Animations use Framer Motion and are gated behind `prefers-reduced-motion`.

**Tech Stack:** React 18, Vite, TypeScript, Framer Motion, Vitest + React Testing Library, plain CSS with custom-property design tokens.

## Global Constraints

- Build with **React + Vite + TypeScript** only; no other framework.
- **All** site content comes from `src/data/content.ts` — no hardcoded copy in components or commands.
- Terminal is a **full-screen overlay**, not a route. Standard site is the **default** mode.
- Animations use **Framer Motion** and **must** be disabled when `prefers-reduced-motion: reduce`.
- **No backend**: contact is email + social links only.
- Terminal prompt string is exactly `visitor@portfolio:~$`.
- Tests use **Vitest + React Testing Library**; the command interpreter and hooks are built test-first.
- Keep dependencies minimal (YAGNI): only `react`, `react-dom`, `framer-motion` as runtime deps.

---

### Task 1: Project scaffold & test infrastructure

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/globals.css`, `src/vite-env.d.ts`, `src/test/setup.ts`
- Test: `src/test/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a running Vite dev server, a working `npm test`, and `App` as the root component (replaced in later tasks).

- [ ] **Step 1: Scaffold the Vite React-TS project**

Run in the project root (`/home/claude/code/portfolio`):
```bash
npm create vite@latest . -- --template react-ts
```
If prompted about a non-empty directory, choose "Ignore files and continue". Then:
```bash
npm install
npm install framer-motion
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Configure Vitest in `vite.config.ts`**

Replace `vite.config.ts` with:
```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
```

- [ ] **Step 3: Add the test setup file**

Create `src/test/setup.ts`:
```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Add the test script**

In `package.json`, ensure the `scripts` block contains:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 5: Write a smoke test**

Create `src/test/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('test infrastructure', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run the smoke test, expect PASS**

Run: `npm test`
Expected: 1 passing test.

- [ ] **Step 7: Add base design tokens**

Replace `src/styles/globals.css`:
```css
:root {
  --bg: #0b0f17;
  --bg-elev: #121826;
  --fg: #e6edf3;
  --muted: #93a1b1;
  --accent: #5eead4;
  --accent-2: #818cf8;
  --danger: #f87171;
  --success: #4ade80;
  --border: #1f2937;
  --radius: 14px;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace;
  --maxw: 1100px;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
```

- [ ] **Step 8: Wire fonts and root in `index.html`**

Replace `index.html` body/head essentials so `<head>` includes the fonts and `<title>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
<title>Portfolio</title>
```
Keep the existing `<div id="root"></div>` and `<script type="module" src="/src/main.tsx"></script>`.

- [ ] **Step 9: Minimal `App.tsx` and `main.tsx`**

Set `src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```
Set `src/App.tsx`:
```tsx
export default function App() {
  return <main>portfolio scaffold</main>;
}
```
Delete the Vite template leftovers: `src/App.css`, `src/index.css`, `src/assets/react.svg` (if present).

- [ ] **Step 10: Verify dev server builds**

Run: `npm run build`
Expected: build completes with no type errors.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite React-TS project with Vitest"
```

---

### Task 2: Content model & data

**Files:**
- Create: `src/data/content.ts`
- Test: `src/data/content.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface Project { slug: string; name: string; summary: string; description: string; stack: string[]; highlights: string[]; live?: string; repo?: string; }`
  - `interface Experience { role: string; org: string; period: string; points: string[]; }`
  - `interface Socials { github?: string; linkedin?: string; email: string; [k: string]: string | undefined; }`
  - `interface Content { profile: { name: string; tagline: string; bio: string; location?: string; resumeUrl?: string }; socials: Socials; projects: Project[]; skills: { languages: string[]; frameworks: string[]; tools: string[] }; experience: Experience[]; }`
  - `export const content: Content` (placeholder data).

- [ ] **Step 1: Write the failing test**

Create `src/data/content.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { content } from './content';

describe('content', () => {
  it('has a profile name and email', () => {
    expect(content.profile.name).toBeTruthy();
    expect(content.socials.email).toMatch(/@/);
  });
  it('has at least one project with a slug and stack', () => {
    expect(content.projects.length).toBeGreaterThan(0);
    for (const p of content.projects) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(p.stack.length).toBeGreaterThan(0);
    }
  });
  it('has unique project slugs', () => {
    const slugs = content.projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
```

- [ ] **Step 2: Run the test, expect FAIL**

Run: `npm test -- content`
Expected: FAIL — cannot find module `./content`.

- [ ] **Step 3: Implement `content.ts`**

Create `src/data/content.ts`:
```ts
export interface Project {
  slug: string;
  name: string;
  summary: string;
  description: string;
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

export interface Socials {
  github?: string;
  linkedin?: string;
  email: string;
  [k: string]: string | undefined;
}

export interface Content {
  profile: {
    name: string;
    tagline: string;
    bio: string;
    location?: string;
    resumeUrl?: string;
  };
  socials: Socials;
  projects: Project[];
  skills: { languages: string[]; frameworks: string[]; tools: string[] };
  experience: Experience[];
}

// ─────────────────────────────────────────────────────────────
// EDIT THIS FILE to make the portfolio yours. Replace every
// "Your …" placeholder. Both the standard site and the terminal
// read from here, so you only update your info in one place.
// ─────────────────────────────────────────────────────────────
export const content: Content = {
  profile: {
    name: 'Your Name',
    tagline: 'Front-end developer building accessible, animated web experiences',
    bio: "Recently qualified web developer focused on the front end. I learn by building — most of what I know comes from shipping personal projects end to end, from design to deploy. I care about clean, accessible UI and the small details that make an interface feel good.",
    location: 'Your City, Country',
    resumeUrl: '/resume.pdf',
  },
  socials: {
    github: 'https://github.com/yourhandle',
    linkedin: 'https://linkedin.com/in/yourhandle',
    email: 'you@example.com',
  },
  projects: [
    {
      slug: 'project-one',
      name: 'Project One',
      summary: 'A short one-line description of what it does.',
      description:
        'A longer paragraph about Project One: the problem it solves, what you built, and what you learned. Mention the interesting technical challenge you solved.',
      stack: ['React', 'TypeScript', 'Vite'],
      highlights: [
        'Implemented X feature that does Y',
        'Optimized Z, improving load time by N%',
      ],
      live: 'https://example.com',
      repo: 'https://github.com/yourhandle/project-one',
    },
    {
      slug: 'project-two',
      name: 'Project Two',
      summary: 'Another one-line description.',
      description:
        'Details about Project Two. What was the goal, what is notable about the implementation, and what would you do next.',
      stack: ['Next.js', 'Tailwind CSS', 'PostgreSQL'],
      highlights: ['Built a real-time feature with websockets', 'Designed the schema and API'],
      repo: 'https://github.com/yourhandle/project-two',
    },
    {
      slug: 'project-three',
      name: 'Project Three',
      summary: 'A third project to round out the portfolio.',
      description: 'Describe a project that shows a different skill — maybe a tool, a game, or a CLI.',
      stack: ['JavaScript', 'Node.js', 'Canvas API'],
      highlights: ['Wrote a small game loop from scratch', 'No external game libraries'],
      live: 'https://example.com/three',
    },
  ],
  skills: {
    languages: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'SQL'],
    frameworks: ['React', 'Next.js', 'Node.js', 'Express'],
    tools: ['Git', 'Vite', 'Figma', 'Vitest', 'Docker'],
  },
  experience: [
    {
      role: 'Front-end Developer Intern',
      org: 'Company Name',
      period: '2025',
      points: [
        'Built and shipped UI components used across the product.',
        'Collaborated with designers to translate Figma into responsive React.',
      ],
    },
    {
      role: 'Web Development Intern',
      org: 'Another Company',
      period: '2024',
      points: ['Fixed bugs and added small features to a production codebase.'],
    },
  ],
};
```

- [ ] **Step 4: Run the test, expect PASS**

Run: `npm test -- content`
Expected: 3 passing tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add typed content model with placeholder data"
```

---

### Task 3: Command interpreter — types, dispatch, and suggestions

**Files:**
- Create: `src/lib/types.ts`, `src/lib/suggest.ts`, `src/lib/commands.ts`
- Test: `src/lib/suggest.test.ts`, `src/lib/commands.test.ts`

**Interfaces:**
- Consumes: `Content` from `src/data/content.ts`.
- Produces:
  - `src/lib/types.ts`:
    - `type OutputLine = { type: 'text' | 'error' | 'success' | 'heading'; text: string } | { type: 'link'; label: string; href: string }`
    - `interface CommandContext { content: Content; history: string[]; actions: { clear: () => void; exit: () => void; openUrl: (url: string) => void } }`
    - `type CommandHandler = (args: string[], ctx: CommandContext) => OutputLine[]`
    - `interface Command { name: string; description: string; handler: CommandHandler }`
  - `src/lib/suggest.ts`: `export function suggestCommand(input: string, names: string[]): string | null`
  - `src/lib/commands.ts`: `export const registry: Record<string, Command>`, `export const commandNames: string[]`, `export function runCommand(input: string, ctx: CommandContext): OutputLine[]`. (Registry is populated with the `help` command only in this task; later tasks add commands.)

- [ ] **Step 1: Create the types file**

Create `src/lib/types.ts`:
```ts
import type { Content } from '../data/content';

export type OutputLine =
  | { type: 'text' | 'error' | 'success' | 'heading'; text: string }
  | { type: 'link'; label: string; href: string };

export interface CommandContext {
  content: Content;
  history: string[];
  actions: {
    clear: () => void;
    exit: () => void;
    openUrl: (url: string) => void;
  };
}

export type CommandHandler = (args: string[], ctx: CommandContext) => OutputLine[];

export interface Command {
  name: string;
  description: string;
  handler: CommandHandler;
}
```

- [ ] **Step 2: Write the failing test for `suggestCommand`**

Create `src/lib/suggest.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { suggestCommand } from './suggest';

const names = ['help', 'about', 'projects', 'skills', 'contact', 'clear'];

describe('suggestCommand', () => {
  it('suggests the nearest command for a typo', () => {
    expect(suggestCommand('porjects', names)).toBe('projects');
    expect(suggestCommand('abou', names)).toBe('about');
  });
  it('returns null when nothing is close', () => {
    expect(suggestCommand('zzzzzzzz', names)).toBeNull();
  });
});
```

- [ ] **Step 3: Run it, expect FAIL**

Run: `npm test -- suggest`
Expected: FAIL — cannot find module `./suggest`.

- [ ] **Step 4: Implement `suggest.ts`**

Create `src/lib/suggest.ts`:
```ts
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return dp[n];
}

export function suggestCommand(input: string, names: string[]): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const name of names) {
    const d = levenshtein(input.toLowerCase(), name);
    if (d < bestDist) {
      bestDist = d;
      best = name;
    }
  }
  // only suggest if reasonably close (<= ~third of the word)
  const threshold = Math.max(2, Math.floor(input.length / 2));
  return best !== null && bestDist <= threshold ? best : null;
}
```

- [ ] **Step 5: Run it, expect PASS**

Run: `npm test -- suggest`
Expected: 2 passing tests.

- [ ] **Step 6: Write the failing test for the registry/dispatch**

Create `src/lib/commands.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { runCommand, commandNames } from './commands';
import type { CommandContext } from './types';
import { content } from '../data/content';

function makeCtx(overrides: Partial<CommandContext['actions']> = {}): CommandContext {
  return {
    content,
    history: [],
    actions: { clear: vi.fn(), exit: vi.fn(), openUrl: vi.fn(), ...overrides },
  };
}

describe('runCommand', () => {
  it('returns nothing for empty input', () => {
    expect(runCommand('   ', makeCtx())).toEqual([]);
  });
  it('runs help and lists commands', () => {
    const out = runCommand('help', makeCtx());
    expect(out.some((l) => l.type === 'heading')).toBe(true);
    expect(commandNames).toContain('help');
  });
  it('reports unknown commands with a suggestion', () => {
    const out = runCommand('halp', makeCtx());
    expect(out[0]).toMatchObject({ type: 'error' });
    expect(out.some((l) => 'text' in l && l.text.includes('help'))).toBe(true);
  });
  it('is case-insensitive on command names', () => {
    const out = runCommand('HELP', makeCtx());
    expect(out.some((l) => l.type === 'heading')).toBe(true);
  });
});
```

- [ ] **Step 7: Run it, expect FAIL**

Run: `npm test -- commands`
Expected: FAIL — cannot find module `./commands`.

- [ ] **Step 8: Implement `commands.ts` with dispatch + `help`**

Create `src/lib/commands.ts`:
```ts
import type { Command, CommandContext, OutputLine } from './types';
import { suggestCommand } from './suggest';

export const registry: Record<string, Command> = {};

function register(cmd: Command) {
  registry[cmd.name] = cmd;
}

// `help` lists everything in the registry.
register({
  name: 'help',
  description: 'List available commands',
  handler: () => {
    const lines: OutputLine[] = [{ type: 'heading', text: 'Available commands' }];
    for (const name of Object.keys(registry).sort()) {
      lines.push({ type: 'text', text: `  ${name.padEnd(12)} ${registry[name].description}` });
    }
    lines.push({ type: 'text', text: '' });
    lines.push({ type: 'text', text: 'Tip: use Tab to autocomplete and ↑/↓ for history.' });
    return lines;
  },
});

export const commandNames: string[] = [];

export function runCommand(input: string, ctx: CommandContext): OutputLine[] {
  const trimmed = input.trim();
  if (!trimmed) return [];
  const [rawName, ...args] = trimmed.split(/\s+/);
  const name = rawName.toLowerCase();
  const cmd = registry[name];
  if (!cmd) {
    const out: OutputLine[] = [{ type: 'error', text: `command not found: ${rawName}` }];
    const suggestion = suggestCommand(name, Object.keys(registry));
    if (suggestion) out.push({ type: 'text', text: `Did you mean \`${suggestion}\`?` });
    out.push({ type: 'text', text: 'Type `help` to see available commands.' });
    return out;
  }
  return cmd.handler(args, ctx);
}

// keep commandNames in sync after all registrations (this module + side-effect imports)
export function refreshCommandNames() {
  commandNames.length = 0;
  commandNames.push(...Object.keys(registry).sort());
}
refreshCommandNames();
```

Note: `commandNames` is refreshed again at the end of Task 4/5 after more commands register. Since all commands register at module load, importing `commands.ts` anywhere triggers registration; we call `refreshCommandNames()` at the bottom of the last registration file. For now the test only checks `help` is present.

- [ ] **Step 9: Run it, expect PASS**

Run: `npm test -- commands`
Expected: 4 passing tests.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: command interpreter core with dispatch and suggestions"
```

---

### Task 4: Content commands

**Files:**
- Modify: `src/lib/commands.ts`
- Test: `src/lib/commands.content.test.ts`

**Interfaces:**
- Consumes: `registry`, `register` pattern, `OutputLine`, `CommandContext` from Task 3.
- Produces: registered commands `about`, `projects`, `skills`, `experience`, `contact`, `social`, `resume`, `whoami`, `echo`, `clear`, `exit`, `open`, `sudo`.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/commands.content.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { runCommand } from './commands';
import type { CommandContext } from './types';
import { content } from '../data/content';

function makeCtx(overrides: Partial<CommandContext['actions']> = {}): CommandContext {
  return {
    content,
    history: ['help', 'about'],
    actions: { clear: vi.fn(), exit: vi.fn(), openUrl: vi.fn(), ...overrides },
  };
}

describe('content commands', () => {
  it('about prints the bio', () => {
    const out = runCommand('about', makeCtx());
    expect(out.some((l) => 'text' in l && l.text.includes(content.profile.bio.slice(0, 10)))).toBe(true);
  });
  it('projects lists every project name', () => {
    const out = runCommand('projects', makeCtx());
    for (const p of content.projects) {
      expect(out.some((l) => 'text' in l && l.text.includes(p.name))).toBe(true);
    }
  });
  it('contact includes an email link', () => {
    const out = runCommand('contact', makeCtx());
    expect(out.some((l) => l.type === 'link' && l.href.startsWith('mailto:'))).toBe(true);
  });
  it('echo repeats its arguments', () => {
    const out = runCommand('echo hello world', makeCtx());
    expect(out).toEqual([{ type: 'text', text: 'hello world' }]);
  });
  it('clear calls the clear action', () => {
    const clear = vi.fn();
    runCommand('clear', makeCtx({ clear }));
    expect(clear).toHaveBeenCalled();
  });
  it('exit calls the exit action', () => {
    const exit = vi.fn();
    runCommand('exit', makeCtx({ exit }));
    expect(exit).toHaveBeenCalled();
  });
  it('open <slug> opens the project link', () => {
    const openUrl = vi.fn();
    const slug = content.projects[0].slug;
    runCommand(`open ${slug}`, makeCtx({ openUrl }));
    expect(openUrl).toHaveBeenCalledWith(
      content.projects[0].live ?? content.projects[0].repo,
    );
  });
  it('open with an unknown slug errors', () => {
    const out = runCommand('open nope-nope', makeCtx());
    expect(out[0]).toMatchObject({ type: 'error' });
  });
  it('sudo returns a cheeky denial', () => {
    const out = runCommand('sudo rm -rf /', makeCtx());
    expect(out[0]).toMatchObject({ type: 'error' });
  });
  it('whoami prints visitor', () => {
    const out = runCommand('whoami', makeCtx());
    expect(out.some((l) => 'text' in l && /visitor/i.test(l.text))).toBe(true);
  });
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `npm test -- commands.content`
Expected: FAIL — these commands are not registered yet.

- [ ] **Step 3: Add the content commands to `commands.ts`**

In `src/lib/commands.ts`, after the `help` registration and before `export const commandNames`, insert:
```ts
register({
  name: 'about',
  description: 'Who I am',
  handler: (_a, ctx) => [
    { type: 'heading', text: ctx.content.profile.name },
    { type: 'text', text: ctx.content.profile.tagline },
    { type: 'text', text: '' },
    { type: 'text', text: ctx.content.profile.bio },
  ],
});

register({
  name: 'projects',
  description: 'List my projects',
  handler: (_a, ctx) => {
    const lines: OutputLine[] = [{ type: 'heading', text: 'Projects' }];
    for (const p of ctx.content.projects) {
      lines.push({ type: 'text', text: `  ${p.name} — ${p.summary}` });
      lines.push({ type: 'text', text: `    [${p.stack.join(', ')}]  (cat projects/${p.slug})` });
    }
    return lines;
  },
});

register({
  name: 'skills',
  description: 'My technical skills',
  handler: (_a, ctx) => {
    const { languages, frameworks, tools } = ctx.content.skills;
    return [
      { type: 'heading', text: 'Skills' },
      { type: 'text', text: `  languages:  ${languages.join(', ')}` },
      { type: 'text', text: `  frameworks: ${frameworks.join(', ')}` },
      { type: 'text', text: `  tools:      ${tools.join(', ')}` },
    ];
  },
});

register({
  name: 'experience',
  description: 'My experience and internships',
  handler: (_a, ctx) => {
    const lines: OutputLine[] = [{ type: 'heading', text: 'Experience' }];
    for (const e of ctx.content.experience) {
      lines.push({ type: 'text', text: `  ${e.role} · ${e.org} (${e.period})` });
      for (const pt of e.points) lines.push({ type: 'text', text: `    - ${pt}` });
    }
    return lines;
  },
});

register({
  name: 'contact',
  description: 'How to reach me',
  handler: (_a, ctx) => {
    const { email, github, linkedin } = ctx.content.socials;
    const lines: OutputLine[] = [
      { type: 'heading', text: 'Contact' },
      { type: 'link', label: email, href: `mailto:${email}` },
    ];
    if (github) lines.push({ type: 'link', label: 'GitHub', href: github });
    if (linkedin) lines.push({ type: 'link', label: 'LinkedIn', href: linkedin });
    return lines;
  },
});

register({
  name: 'social',
  description: 'My social links',
  handler: (_a, ctx) => registry.contact.handler(_a, ctx),
});

register({
  name: 'resume',
  description: 'Open my resume',
  handler: (_a, ctx) => {
    const url = ctx.content.profile.resumeUrl;
    if (!url) return [{ type: 'error', text: 'No resume available.' }];
    return [{ type: 'link', label: 'resume.pdf', href: url }];
  },
});

register({
  name: 'whoami',
  description: 'Print the current user',
  handler: () => [{ type: 'text', text: 'visitor — welcome, take a look around.' }],
});

register({
  name: 'echo',
  description: 'Print text',
  handler: (args) => [{ type: 'text', text: args.join(' ') }],
});

register({
  name: 'clear',
  description: 'Clear the screen',
  handler: (_a, ctx) => {
    ctx.actions.clear();
    return [];
  },
});

register({
  name: 'exit',
  description: 'Return to the standard site',
  handler: (_a, ctx) => {
    ctx.actions.exit();
    return [];
  },
});

register({
  name: 'open',
  description: 'Open a project link: open <slug>',
  handler: (args, ctx) => {
    const slug = args[0];
    if (!slug) return [{ type: 'error', text: 'usage: open <project-slug>' }];
    const project = ctx.content.projects.find((p) => p.slug === slug);
    if (!project) return [{ type: 'error', text: `no such project: ${slug}` }];
    const url = project.live ?? project.repo;
    if (!url) return [{ type: 'error', text: `no link available for ${slug}` }];
    ctx.actions.openUrl(url);
    return [{ type: 'success', text: `Opening ${project.name}…` }];
  },
});

register({
  name: 'sudo',
  description: 'Try it and see',
  handler: () => [
    { type: 'error', text: 'visitor is not in the sudoers file. This incident will be reported. 🙂' },
  ],
});
```

- [ ] **Step 4: Run it, expect PASS**

Run: `npm test -- commands.content`
Expected: all passing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add portfolio content commands"
```

---

### Task 5: Virtual filesystem commands (`ls`, `cat`) and completion data

**Files:**
- Create: `src/lib/vfs.ts`
- Modify: `src/lib/commands.ts`
- Test: `src/lib/vfs.test.ts`

**Interfaces:**
- Consumes: `Content`, `registry`/`register`, `refreshCommandNames`.
- Produces:
  - `src/lib/vfs.ts`: `export function listFiles(dir: string | undefined, content: Content): string[]`, `export function readFile(path: string, content: Content): OutputLine[] | null`, `export const ROOT_ENTRIES: string[]` (e.g. `['about.txt','skills.txt','contact.txt','resume.pdf','projects/']`).
  - Registered commands `ls`, `cat`.
  - `refreshCommandNames()` called after all registrations so `commandNames` is complete.

- [ ] **Step 1: Write the failing test**

Create `src/lib/vfs.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { listFiles, readFile, ROOT_ENTRIES } from './vfs';
import { content } from '../data/content';

describe('vfs', () => {
  it('lists root entries', () => {
    expect(listFiles(undefined, content)).toEqual(ROOT_ENTRIES);
  });
  it('lists project files under projects/', () => {
    const files = listFiles('projects/', content);
    expect(files).toContain(`${content.projects[0].slug}.md`);
  });
  it('reads about.txt as the bio', () => {
    const out = readFile('about.txt', content);
    expect(out).not.toBeNull();
    expect(out!.some((l) => 'text' in l && l.text.includes(content.profile.bio.slice(0, 10)))).toBe(true);
  });
  it('reads a project file', () => {
    const slug = content.projects[0].slug;
    const out = readFile(`projects/${slug}.md`, content);
    expect(out).not.toBeNull();
    expect(out!.some((l) => 'text' in l && l.text.includes(content.projects[0].description.slice(0, 10)))).toBe(true);
  });
  it('returns null for unknown files', () => {
    expect(readFile('nope.txt', content)).toBeNull();
  });
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `npm test -- vfs`
Expected: FAIL — cannot find module `./vfs`.

- [ ] **Step 3: Implement `vfs.ts`**

Create `src/lib/vfs.ts`:
```ts
import type { Content } from '../data/content';
import type { OutputLine } from './types';

export const ROOT_ENTRIES = ['about.txt', 'skills.txt', 'contact.txt', 'resume.pdf', 'projects/'];

export function listFiles(dir: string | undefined, content: Content): string[] {
  if (!dir || dir === '.' || dir === '~' || dir === '/') return ROOT_ENTRIES;
  if (dir === 'projects' || dir === 'projects/') {
    return content.projects.map((p) => `${p.slug}.md`);
  }
  return [];
}

export function readFile(path: string, content: Content): OutputLine[] | null {
  switch (path) {
    case 'about.txt':
      return [{ type: 'text', text: content.profile.bio }];
    case 'skills.txt': {
      const { languages, frameworks, tools } = content.skills;
      return [
        { type: 'text', text: `languages:  ${languages.join(', ')}` },
        { type: 'text', text: `frameworks: ${frameworks.join(', ')}` },
        { type: 'text', text: `tools:      ${tools.join(', ')}` },
      ];
    }
    case 'contact.txt':
      return [
        { type: 'link', label: content.socials.email, href: `mailto:${content.socials.email}` },
      ];
    case 'resume.pdf':
      return content.profile.resumeUrl
        ? [{ type: 'link', label: 'resume.pdf', href: content.profile.resumeUrl }]
        : [{ type: 'error', text: 'resume.pdf: not available' }];
  }
  const m = path.match(/^projects\/(.+)\.md$/);
  if (m) {
    const project = content.projects.find((p) => p.slug === m[1]);
    if (!project) return null;
    const lines: OutputLine[] = [
      { type: 'heading', text: project.name },
      { type: 'text', text: project.description },
      { type: 'text', text: '' },
      { type: 'text', text: `stack: ${project.stack.join(', ')}` },
    ];
    for (const h of project.highlights) lines.push({ type: 'text', text: `  - ${h}` });
    return lines;
  }
  return null;
}
```

- [ ] **Step 4: Run it, expect PASS**

Run: `npm test -- vfs`
Expected: 5 passing tests.

- [ ] **Step 5: Register `ls` and `cat` in `commands.ts`**

At the top of `src/lib/commands.ts` add the import:
```ts
import { listFiles, readFile, ROOT_ENTRIES } from './vfs';
```
Then register (before the final `refreshCommandNames()` call):
```ts
register({
  name: 'ls',
  description: 'List files: ls [dir]',
  handler: (args, ctx) => {
    const files = listFiles(args[0], ctx.content);
    if (files.length === 0) return [{ type: 'error', text: `ls: ${args[0]}: no such directory` }];
    return [{ type: 'text', text: files.join('   ') }];
  },
});

register({
  name: 'cat',
  description: 'Read a file: cat <file>',
  handler: (args, ctx) => {
    const path = args[0];
    if (!path) return [{ type: 'error', text: 'usage: cat <file>' }];
    const out = readFile(path, ctx.content);
    if (!out) return [{ type: 'error', text: `cat: ${path}: no such file` }];
    return out;
  },
});
```
Ensure the very last line of the file is:
```ts
refreshCommandNames();
```

- [ ] **Step 6: Add a completion-source export for the hook (used in Task 6)**

Append to `src/lib/commands.ts`:
```ts
// Argument-completion sources: which tokens complete after a given command.
export function argCandidates(commandName: string, content: import('../data/content').Content): string[] {
  if (commandName === 'cat') {
    return [...ROOT_ENTRIES.filter((e) => !e.endsWith('/')), ...content.projects.map((p) => `projects/${p.slug}.md`)];
  }
  if (commandName === 'open') return content.projects.map((p) => p.slug);
  if (commandName === 'ls') return ['projects/'];
  return [];
}
```

- [ ] **Step 7: Run the full suite, expect PASS**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: virtual filesystem with ls/cat and completion sources"
```

---

### Task 6: `useTerminal` hook — history, tab-completion, dispatch

**Files:**
- Create: `src/lib/useTerminal.ts`
- Test: `src/lib/useTerminal.test.ts`

**Interfaces:**
- Consumes: `runCommand`, `commandNames`, `argCandidates` from `commands.ts`; `content`; `OutputLine`.
- Produces:
  - `interface ScrollbackEntry { id: number; input: string | null; output: OutputLine[] }`
  - `interface UseTerminal { entries: ScrollbackEntry[]; input: string; setInput: (s: string) => void; submit: () => void; historyUp: () => void; historyDown: () => void; complete: () => void; }`
  - `export function useTerminal(opts: { onExit: () => void }): UseTerminal`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/useTerminal.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTerminal } from './useTerminal';

describe('useTerminal', () => {
  it('submitting a command appends an entry with output', () => {
    const { result } = renderHook(() => useTerminal({ onExit: vi.fn() }));
    act(() => result.current.setInput('help'));
    act(() => result.current.submit());
    const last = result.current.entries.at(-1)!;
    expect(last.input).toBe('help');
    expect(last.output.length).toBeGreaterThan(0);
    expect(result.current.input).toBe('');
  });

  it('clear empties the scrollback', () => {
    const { result } = renderHook(() => useTerminal({ onExit: vi.fn() }));
    act(() => result.current.setInput('about'));
    act(() => result.current.submit());
    act(() => result.current.setInput('clear'));
    act(() => result.current.submit());
    expect(result.current.entries).toHaveLength(0);
  });

  it('exit invokes onExit', () => {
    const onExit = vi.fn();
    const { result } = renderHook(() => useTerminal({ onExit }));
    act(() => result.current.setInput('exit'));
    act(() => result.current.submit());
    expect(onExit).toHaveBeenCalled();
  });

  it('history up/down recalls previous commands', () => {
    const { result } = renderHook(() => useTerminal({ onExit: vi.fn() }));
    act(() => result.current.setInput('about'));
    act(() => result.current.submit());
    act(() => result.current.setInput('skills'));
    act(() => result.current.submit());
    act(() => result.current.historyUp());
    expect(result.current.input).toBe('skills');
    act(() => result.current.historyUp());
    expect(result.current.input).toBe('about');
    act(() => result.current.historyDown());
    expect(result.current.input).toBe('skills');
  });

  it('tab-completes a unique command prefix', () => {
    const { result } = renderHook(() => useTerminal({ onExit: vi.fn() }));
    act(() => result.current.setInput('ab'));
    act(() => result.current.complete());
    expect(result.current.input).toBe('about ');
  });

  it('tab-completes a file argument after cat', () => {
    const { result } = renderHook(() => useTerminal({ onExit: vi.fn() }));
    act(() => result.current.setInput('cat ab'));
    act(() => result.current.complete());
    expect(result.current.input).toBe('cat about.txt');
  });
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `npm test -- useTerminal`
Expected: FAIL — cannot find module `./useTerminal`.

- [ ] **Step 3: Implement `useTerminal.ts`**

Create `src/lib/useTerminal.ts`:
```ts
import { useCallback, useRef, useState } from 'react';
import { content } from '../data/content';
import type { OutputLine } from './types';
import { runCommand, commandNames, argCandidates } from './commands';

export interface ScrollbackEntry {
  id: number;
  input: string | null;
  output: OutputLine[];
}

export interface UseTerminal {
  entries: ScrollbackEntry[];
  input: string;
  setInput: (s: string) => void;
  submit: () => void;
  historyUp: () => void;
  historyDown: () => void;
  complete: () => void;
}

function longestCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return '';
  let prefix = strings[0];
  for (const s of strings) {
    while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

export function useTerminal(opts: { onExit: () => void }): UseTerminal {
  const [entries, setEntries] = useState<ScrollbackEntry[]>([]);
  const [input, setInput] = useState('');
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1); // -1 = editing fresh input
  const idRef = useRef(0);

  const append = useCallback((input: string | null, output: OutputLine[]) => {
    setEntries((prev) => [...prev, { id: idRef.current++, input, output }]);
  }, []);

  const submit = useCallback(() => {
    const line = input;
    const trimmed = line.trim();
    if (trimmed) historyRef.current.push(trimmed);
    historyIndexRef.current = -1;

    const output = runCommand(line, {
      content,
      history: [...historyRef.current],
      actions: {
        clear: () => setEntries([]),
        exit: opts.onExit,
        openUrl: (url) => window.open(url, '_blank', 'noopener,noreferrer'),
      },
    });

    // `clear` empties entries via its action; don't also append the echo.
    if (trimmed.split(/\s+/)[0]?.toLowerCase() === 'clear') {
      setInput('');
      return;
    }
    append(line, output);
    setInput('');
  }, [input, append, opts.onExit]);

  const historyUp = useCallback(() => {
    const h = historyRef.current;
    if (h.length === 0) return;
    if (historyIndexRef.current === -1) historyIndexRef.current = h.length - 1;
    else historyIndexRef.current = Math.max(0, historyIndexRef.current - 1);
    setInput(h[historyIndexRef.current]);
  }, []);

  const historyDown = useCallback(() => {
    const h = historyRef.current;
    if (historyIndexRef.current === -1) return;
    if (historyIndexRef.current >= h.length - 1) {
      historyIndexRef.current = -1;
      setInput('');
    } else {
      historyIndexRef.current += 1;
      setInput(h[historyIndexRef.current]);
    }
  }, []);

  const complete = useCallback(() => {
    const parts = input.split(/\s+/);
    if (parts.length <= 1) {
      // completing a command name
      const prefix = parts[0] ?? '';
      const matches = commandNames.filter((c) => c.startsWith(prefix));
      if (matches.length === 1) setInput(matches[0] + ' ');
      else if (matches.length > 1) {
        const lcp = longestCommonPrefix(matches);
        if (lcp.length > prefix.length) setInput(lcp);
        else append(input, [{ type: 'text', text: matches.join('   ') }]);
      }
      return;
    }
    // completing an argument
    const cmd = parts[0].toLowerCase();
    const argPrefix = parts[parts.length - 1];
    const candidates = argCandidates(cmd, content).filter((c) => c.startsWith(argPrefix));
    if (candidates.length === 1) {
      parts[parts.length - 1] = candidates[0];
      setInput(parts.join(' '));
    } else if (candidates.length > 1) {
      const lcp = longestCommonPrefix(candidates);
      if (lcp.length > argPrefix.length) {
        parts[parts.length - 1] = lcp;
        setInput(parts.join(' '));
      } else {
        append(input, [{ type: 'text', text: candidates.join('   ') }]);
      }
    }
  }, [input, append]);

  return { entries, input, setInput, submit, historyUp, historyDown, complete };
}
```

- [ ] **Step 4: Run it, expect PASS**

Run: `npm test -- useTerminal`
Expected: 6 passing tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: useTerminal hook with history and tab-completion"
```

---

### Task 7: Terminal UI — overlay, output renderer, command chips

**Files:**
- Create: `src/components/terminal/Terminal.tsx`, `src/components/terminal/TerminalOutput.tsx`, `src/components/terminal/CommandChips.tsx`, `src/components/terminal/terminal.css`
- Test: `src/components/terminal/Terminal.test.tsx`

**Interfaces:**
- Consumes: `useTerminal`, `ScrollbackEntry`, `OutputLine`, `content`.
- Produces: `export function Terminal({ onExit }: { onExit: () => void })` — the full-screen overlay; renders the intro banner, scrollback, prompt input, and (on small screens) command chips.

- [ ] **Step 1: Write the smoke test**

Create `src/components/terminal/Terminal.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Terminal } from './Terminal';

describe('Terminal', () => {
  it('shows the prompt and runs a typed command', async () => {
    render(<Terminal onExit={vi.fn()} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });
    await userEvent.type(input, 'help{Enter}');
    expect(await screen.findByText(/Available commands/i)).toBeInTheDocument();
  });

  it('exit command calls onExit', async () => {
    const onExit = vi.fn();
    render(<Terminal onExit={onExit} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });
    await userEvent.type(input, 'exit{Enter}');
    expect(onExit).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `npm test -- Terminal`
Expected: FAIL — cannot find module `./Terminal`.

- [ ] **Step 3: Implement `TerminalOutput.tsx`**

Create `src/components/terminal/TerminalOutput.tsx`:
```tsx
import type { OutputLine } from '../../lib/types';

export function TerminalOutput({ line }: { line: OutputLine }) {
  if (line.type === 'link') {
    return (
      <div className="term-line">
        <a href={line.href} target="_blank" rel="noopener noreferrer">
          {line.label}
        </a>
      </div>
    );
  }
  return <div className={`term-line term-${line.type}`}>{line.text || ' '}</div>;
}
```

- [ ] **Step 4: Implement `CommandChips.tsx`**

Create `src/components/terminal/CommandChips.tsx`:
```tsx
const CHIPS = ['help', 'about', 'projects', 'skills', 'contact', 'exit'];

export function CommandChips({ onPick }: { onPick: (cmd: string) => void }) {
  return (
    <div className="term-chips" aria-label="quick commands">
      {CHIPS.map((c) => (
        <button key={c} type="button" className="term-chip" onClick={() => onPick(c)}>
          {c}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Implement `Terminal.tsx`**

Create `src/components/terminal/Terminal.tsx`:
```tsx
import { useEffect, useRef } from 'react';
import { useTerminal } from '../../lib/useTerminal';
import { TerminalOutput } from './TerminalOutput';
import { CommandChips } from './CommandChips';
import './terminal.css';

const PROMPT = 'visitor@portfolio:~$';

const INTRO = [
  "Welcome to the terminal. Type 'help' to get started, or 'exit' to leave.",
];

export function Terminal({ onExit }: { onExit: () => void }) {
  const term = useTerminal({ onExit });
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [term.entries]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      term.submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      term.historyUp();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      term.historyDown();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      term.complete();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onExit();
    }
  }

  function pickChip(cmd: string) {
    term.setInput(cmd);
    // submit on next tick after state set
    requestAnimationFrame(() => term.submit());
    inputRef.current?.focus();
  }

  return (
    <div className="term-root" role="dialog" aria-label="Interactive terminal" aria-modal="true">
      <div className="term-bar">
        <span className="term-dot term-dot--red" />
        <span className="term-dot term-dot--amber" />
        <span className="term-dot term-dot--green" />
        <span className="term-title">{PROMPT.replace(':~$', '')}</span>
        <button type="button" className="term-close" onClick={onExit} aria-label="Close terminal">
          ✕
        </button>
      </div>

      <div className="term-screen" ref={scrollRef} onClick={() => inputRef.current?.focus()}>
        {INTRO.map((l, i) => (
          <div key={`intro-${i}`} className="term-line term-intro">
            {l}
          </div>
        ))}

        {term.entries.map((entry) => (
          <div key={entry.id} className="term-entry">
            {entry.input !== null && (
              <div className="term-line term-echo">
                <span className="term-prompt">{PROMPT}</span> {entry.input}
              </div>
            )}
            {entry.output.map((line, i) => (
              <TerminalOutput key={i} line={line} />
            ))}
          </div>
        ))}

        <div className="term-inputline">
          <span className="term-prompt">{PROMPT}</span>
          <input
            ref={inputRef}
            className="term-input"
            aria-label="terminal input"
            value={term.input}
            onChange={(e) => term.setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      </div>

      <CommandChips onPick={pickChip} />
    </div>
  );
}
```

- [ ] **Step 6: Implement `terminal.css`**

Create `src/components/terminal/terminal.css`:
```css
.term-root {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: #0a0e14;
  font-family: var(--font-mono);
  color: #c9d1d9;
}
.term-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #11161f;
  border-bottom: 1px solid #1f2733;
}
.term-dot { width: 12px; height: 12px; border-radius: 50%; }
.term-dot--red { background: #ff5f57; }
.term-dot--amber { background: #febc2e; }
.term-dot--green { background: #28c840; }
.term-title { margin-left: 10px; color: #8b949e; font-size: 13px; }
.term-close {
  margin-left: auto; background: none; border: none; color: #8b949e;
  cursor: pointer; font-size: 14px;
}
.term-screen {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
}
.term-line { white-space: pre-wrap; word-break: break-word; }
.term-error { color: #ff7b72; }
.term-success { color: #56d364; }
.term-heading { color: #58a6ff; font-weight: 700; margin-top: 6px; }
.term-intro { color: #8b949e; margin-bottom: 10px; }
.term-prompt { color: #56d364; }
.term-echo { color: #c9d1d9; }
.term-inputline { display: flex; align-items: baseline; gap: 8px; }
.term-input {
  flex: 1; background: transparent; border: none; outline: none;
  color: #c9d1d9; font-family: var(--font-mono); font-size: 14px;
  caret-color: #56d364;
}
.term-chips {
  display: none;
  gap: 8px; padding: 10px; border-top: 1px solid #1f2733;
  overflow-x: auto; background: #0a0e14;
}
.term-chip {
  background: #161b22; border: 1px solid #30363d; color: #c9d1d9;
  border-radius: 999px; padding: 6px 12px; font-family: var(--font-mono);
  font-size: 13px; white-space: nowrap; cursor: pointer;
}
@media (max-width: 640px) {
  .term-chips { display: flex; }
}
```

- [ ] **Step 7: Run the test, expect PASS**

Run: `npm test -- Terminal`
Expected: 2 passing tests.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: terminal overlay UI with output renderer and mobile chips"
```

---

### Task 8: App shell — mode state, toggle, URL hash, localStorage

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/shared/ModeToggle.tsx`, `src/components/shared/mode-toggle.css`, `src/lib/useMode.ts`
- Test: `src/lib/useMode.test.ts`

**Interfaces:**
- Consumes: `Terminal` from Task 7; standard sections come in later tasks (use a placeholder `<StandardSite />` import that Task 10–12 fills — for now render a stub).
- Produces:
  - `src/lib/useMode.ts`: `type Mode = 'standard' | 'terminal'`; `export function useMode(): { mode: Mode; open: () => void; close: () => void }` — syncs to `location.hash` (`#terminal`) and `localStorage['portfolio-mode']`, and opens on the `` ` `` key, closes on `Esc`.
  - `ModeToggle`: floating `>_` button that calls `open`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/useMode.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMode } from './useMode';

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '';
});

describe('useMode', () => {
  it('defaults to standard', () => {
    const { result } = renderHook(() => useMode());
    expect(result.current.mode).toBe('standard');
  });
  it('open() switches to terminal and sets the hash', () => {
    const { result } = renderHook(() => useMode());
    act(() => result.current.open());
    expect(result.current.mode).toBe('terminal');
    expect(window.location.hash).toBe('#terminal');
  });
  it('close() returns to standard', () => {
    const { result } = renderHook(() => useMode());
    act(() => result.current.open());
    act(() => result.current.close());
    expect(result.current.mode).toBe('standard');
  });
  it('initializes from #terminal hash', () => {
    window.location.hash = '#terminal';
    const { result } = renderHook(() => useMode());
    expect(result.current.mode).toBe('terminal');
  });
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `npm test -- useMode`
Expected: FAIL — cannot find module `./useMode`.

- [ ] **Step 3: Implement `useMode.ts`**

Create `src/lib/useMode.ts`:
```ts
import { useCallback, useEffect, useState } from 'react';

export type Mode = 'standard' | 'terminal';
const KEY = 'portfolio-mode';

function initialMode(): Mode {
  if (typeof window === 'undefined') return 'standard';
  if (window.location.hash === '#terminal') return 'terminal';
  return localStorage.getItem(KEY) === 'terminal' ? 'terminal' : 'standard';
}

export function useMode() {
  const [mode, setMode] = useState<Mode>(initialMode);

  const open = useCallback(() => {
    setMode('terminal');
    window.location.hash = 'terminal';
    localStorage.setItem(KEY, 'terminal');
  }, []);

  const close = useCallback(() => {
    setMode('standard');
    if (window.location.hash === '#terminal') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    localStorage.setItem(KEY, 'standard');
  }, []);

  // global keyboard: backtick opens, Escape closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (e.key === '`' && !typing) {
        e.preventDefault();
        open();
      } else if (e.key === 'Escape') {
        close();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  // react to hash changes (back/forward, shared links)
  useEffect(() => {
    function onHash() {
      setMode(window.location.hash === '#terminal' ? 'terminal' : 'standard');
    }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return { mode, open, close };
}
```

- [ ] **Step 4: Run it, expect PASS**

Run: `npm test -- useMode`
Expected: 4 passing tests.

- [ ] **Step 5: Implement `ModeToggle.tsx` and its CSS**

Create `src/components/shared/ModeToggle.tsx`:
```tsx
import './mode-toggle.css';

export function ModeToggle({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="mode-toggle" onClick={onOpen} aria-label="Open terminal mode (or press the backtick key)">
      <span aria-hidden="true">{'>_'}</span>
    </button>
  );
}
```
Create `src/components/shared/mode-toggle.css`:
```css
.mode-toggle {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 50;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--bg-elev);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.mode-toggle:hover { transform: translateY(-2px); border-color: var(--accent); }
```

- [ ] **Step 6: Wire `App.tsx` (temporary standard stub)**

Replace `src/App.tsx`:
```tsx
import { useMode } from './lib/useMode';
import { Terminal } from './components/terminal/Terminal';
import { ModeToggle } from './components/shared/ModeToggle';

export default function App() {
  const { mode, open, close } = useMode();
  return (
    <>
      {/* StandardSite is implemented in Tasks 10–12; stub for now */}
      <main style={{ padding: 40 }}>
        <h1>Standard site coming soon</h1>
        <p>Press the backtick key or the button to open the terminal.</p>
      </main>
      <ModeToggle onOpen={open} />
      {mode === 'terminal' && <Terminal onExit={close} />}
    </>
  );
}
```

- [ ] **Step 7: Verify build + full test suite**

Run: `npm run build && npm test`
Expected: build clean, all tests pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: app shell with mode toggle, hash sync, and keyboard shortcuts"
```

---

### Task 9: Motion foundation — reduced-motion hook, scroll-reveal, variants

**Files:**
- Create: `src/hooks/usePrefersReducedMotion.ts`, `src/hooks/useScrollReveal.ts`, `src/lib/motion.ts`
- Test: `src/hooks/usePrefersReducedMotion.test.ts`

**Interfaces:**
- Consumes: nothing app-specific.
- Produces:
  - `export function usePrefersReducedMotion(): boolean`
  - `useScrollReveal` returning props to spread for a reveal-on-scroll element (uses Framer Motion `useInView`).
  - `src/lib/motion.ts`: `fadeUp` variant + `stagger` container variant + `revealViewport` config.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/usePrefersReducedMotion.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('usePrefersReducedMotion', () => {
  beforeEach(() => mockMatchMedia(false));
  it('returns false when motion is allowed', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
  it('returns true when reduce is set', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `npm test -- usePrefersReducedMotion`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement `usePrefersReducedMotion.ts`**

Create `src/hooks/usePrefersReducedMotion.ts`:
```ts
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
```

- [ ] **Step 4: Run it, expect PASS**

Run: `npm test -- usePrefersReducedMotion`
Expected: 2 passing tests.

- [ ] **Step 5: Implement `motion.ts` variants**

Create `src/lib/motion.ts`:
```ts
import type { Variants } from 'framer-motion';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const revealViewport = { once: true, amount: 0.2 } as const;
```

- [ ] **Step 6: Implement `useScrollReveal.ts`**

Create `src/hooks/useScrollReveal.ts`:
```ts
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { revealViewport } from '../lib/motion';

// Returns a ref + a boolean for whether the element has entered the viewport.
export function useScrollReveal() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, revealViewport);
  return { ref, inView };
}
```

- [ ] **Step 7: Run full suite + build**

Run: `npm test && npm run build`
Expected: all green.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: motion foundation with reduced-motion support"
```

---

### Task 10: Standard site — layout, Nav, Hero

**Files:**
- Create: `src/components/standard/StandardSite.tsx`, `src/components/standard/Nav.tsx`, `src/components/standard/Hero.tsx`, `src/components/standard/standard.css`
- Modify: `src/App.tsx` (swap the stub for `<StandardSite onOpenTerminal={open} />`)
- Test: `src/components/standard/Hero.test.tsx`

**Interfaces:**
- Consumes: `content`, `usePrefersReducedMotion`, `fadeUp`, Framer Motion.
- Produces: `export function StandardSite({ onOpenTerminal }: { onOpenTerminal: () => void })` rendering Nav + sections (sections filled in Tasks 11–12; for now Nav + Hero + placeholders).

- [ ] **Step 1: Write the Hero test**

Create `src/components/standard/Hero.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';
import { content } from '../../data/content';

describe('Hero', () => {
  it('renders the name and a working terminal hint button', () => {
    render(<Hero onOpenTerminal={vi.fn()} />);
    expect(screen.getByRole('heading', { name: new RegExp(content.profile.name, 'i') })).toBeInTheDocument();
  });
  it('calls onOpenTerminal when the hint is clicked', async () => {
    const onOpen = vi.fn();
    render(<Hero onOpenTerminal={onOpen} />);
    screen.getByRole('button', { name: /terminal mode/i }).click();
    expect(onOpen).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `npm test -- Hero`
Expected: FAIL — cannot find module `./Hero`.

- [ ] **Step 3: Implement `Hero.tsx`**

Create `src/components/standard/Hero.tsx`:
```tsx
import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export function Hero({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const reduced = usePrefersReducedMotion();
  const { name, tagline } = content.profile;

  return (
    <section id="home" className="hero">
      <div className="hero__aurora" aria-hidden="true" />
      <div className="container hero__inner">
        <motion.p
          className="hero__eyebrow"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Hi, my name is
        </motion.p>
        <motion.h1
          className="hero__name"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          {name}
        </motion.h1>
        <motion.p
          className="hero__tagline"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          {tagline}
        </motion.p>
        <div className="hero__cta">
          <a className="btn btn--primary" href="#projects">View my work</a>
          <a className="btn btn--ghost" href="#contact">Get in touch</a>
        </div>
        <button type="button" className="hero__hint" onClick={onOpenTerminal}>
          <span className="hero__hint-key">`</span> psst — press backtick for terminal mode
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement `Nav.tsx`**

Create `src/components/standard/Nav.tsx`:
```tsx
import { content } from '../../data/content';

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
];

export function Nav({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  return (
    <header className="nav">
      <div className="container nav__inner">
        <a href="#home" className="nav__brand">{content.profile.name.split(' ')[0]}<span>.</span></a>
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
          <button type="button" className="nav__term" onClick={onOpenTerminal} aria-label="Open terminal mode">{'>_'}</button>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Implement `StandardSite.tsx` (Nav + Hero + section placeholders)**

Create `src/components/standard/StandardSite.tsx`:
```tsx
import { Nav } from './Nav';
import { Hero } from './Hero';
import './standard.css';

export function StandardSite({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  return (
    <>
      <Nav onOpenTerminal={onOpenTerminal} />
      <main>
        <Hero onOpenTerminal={onOpenTerminal} />
        {/* About, Projects, Skills, Experience, Contact, Footer added in Tasks 11–12 */}
      </main>
    </>
  );
}
```

- [ ] **Step 6: Implement `standard.css` (base + nav + hero + buttons)**

Create `src/components/standard/standard.css`:
```css
.container { max-width: var(--maxw); margin: 0 auto; padding: 0 24px; }

.btn {
  display: inline-block; padding: 12px 20px; border-radius: 12px;
  font-weight: 600; transition: transform 0.15s ease, background 0.15s ease;
}
.btn:hover { transform: translateY(-2px); text-decoration: none; }
.btn--primary { background: var(--accent); color: #06231f; }
.btn--ghost { border: 1px solid var(--border); color: var(--fg); }

/* Nav */
.nav {
  position: sticky; top: 0; z-index: 40;
  backdrop-filter: blur(10px);
  background: rgba(11, 15, 23, 0.7);
  border-bottom: 1px solid var(--border);
}
.nav__inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
.nav__brand { font-family: var(--font-mono); font-weight: 700; color: var(--fg); }
.nav__brand span { color: var(--accent); }
.nav__links { display: flex; align-items: center; gap: 22px; }
.nav__links a { color: var(--muted); font-size: 14px; }
.nav__links a:hover { color: var(--fg); text-decoration: none; }
.nav__term {
  font-family: var(--font-mono); background: var(--bg-elev);
  border: 1px solid var(--border); color: var(--accent);
  border-radius: 8px; padding: 4px 8px; cursor: pointer;
}
@media (max-width: 640px) {
  .nav__links a { display: none; }
}

/* Hero */
.hero { position: relative; overflow: hidden; padding: 140px 0 120px; }
.hero__aurora {
  position: absolute; inset: -20% -10% auto -10%; height: 520px;
  background:
    radial-gradient(40% 60% at 20% 30%, rgba(94, 234, 212, 0.25), transparent 60%),
    radial-gradient(40% 60% at 80% 20%, rgba(129, 140, 248, 0.25), transparent 60%);
  filter: blur(20px);
  animation: drift 14s ease-in-out infinite alternate;
}
@keyframes drift {
  from { transform: translateY(0) scale(1); }
  to { transform: translateY(20px) scale(1.05); }
}
.hero__inner { position: relative; }
.hero__eyebrow { color: var(--accent); font-family: var(--font-mono); margin: 0 0 12px; }
.hero__name { font-size: clamp(40px, 8vw, 76px); line-height: 1.05; margin: 0; font-weight: 800; }
.hero__tagline { font-size: clamp(18px, 3vw, 26px); color: var(--muted); max-width: 640px; margin: 18px 0 28px; }
.hero__cta { display: flex; gap: 14px; flex-wrap: wrap; }
.hero__hint {
  margin-top: 36px; background: none; border: none; cursor: pointer;
  color: var(--muted); font-family: var(--font-mono); font-size: 13px;
}
.hero__hint-key {
  border: 1px solid var(--border); border-radius: 6px; padding: 1px 7px;
  color: var(--accent); margin-right: 6px;
}

/* Generic section rhythm (used by later tasks) */
.section { padding: 96px 0; }
.section__title { font-size: clamp(26px, 5vw, 40px); margin: 0 0 8px; }
.section__title span { color: var(--accent); font-family: var(--font-mono); font-size: 0.6em; }
.section__lead { color: var(--muted); max-width: 640px; margin: 0 0 36px; }
```

- [ ] **Step 7: Swap the stub in `App.tsx`**

Replace `src/App.tsx`:
```tsx
import { useMode } from './lib/useMode';
import { Terminal } from './components/terminal/Terminal';
import { StandardSite } from './components/standard/StandardSite';

export default function App() {
  const { mode, open, close } = useMode();
  return (
    <>
      <StandardSite onOpenTerminal={open} />
      {mode === 'terminal' && <Terminal onExit={close} />}
    </>
  );
}
```
Note: the floating `ModeToggle` is now redundant with the nav button; keep the nav `>_` as the primary affordance. (The `ModeToggle` component remains available but is not mounted.)

- [ ] **Step 8: Run tests + build**

Run: `npm test -- Hero && npm run build`
Expected: Hero tests pass, build clean.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: standard site shell with nav and animated hero"
```

---

### Task 11: Standard sections — About, Skills, Experience

**Files:**
- Create: `src/components/standard/About.tsx`, `src/components/standard/Skills.tsx`, `src/components/standard/Experience.tsx`
- Modify: `src/components/standard/StandardSite.tsx`, `src/components/standard/standard.css`
- Test: `src/components/standard/sections.test.tsx`

**Interfaces:**
- Consumes: `content`, `usePrefersReducedMotion`, `fadeUp`, `staggerContainer`, `useScrollReveal`, Framer Motion.
- Produces: `About`, `Skills`, `Experience` components (no props; read from `content`).

- [ ] **Step 1: Write the failing test**

Create `src/components/standard/sections.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { About } from './About';
import { Skills } from './Skills';
import { Experience } from './Experience';
import { content } from '../../data/content';

describe('content sections', () => {
  it('About renders the bio', () => {
    render(<About />);
    expect(screen.getByText(new RegExp(content.profile.bio.slice(0, 12), 'i'))).toBeInTheDocument();
  });
  it('Skills renders every language', () => {
    render(<Skills />);
    for (const s of content.skills.languages) {
      expect(screen.getByText(s)).toBeInTheDocument();
    }
  });
  it('Experience renders every role', () => {
    render(<Experience />);
    for (const e of content.experience) {
      expect(screen.getByText(new RegExp(e.role, 'i'))).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `npm test -- sections`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `About.tsx`**

Create `src/components/standard/About.tsx`:
```tsx
import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { fadeUp } from '../../lib/motion';
import { revealViewport } from '../../lib/motion';

export function About() {
  const { bio, location } = content.profile;
  return (
    <section id="about" className="section">
      <div className="container">
        <motion.h2
          className="section__title"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealViewport}
        >
          <span>01.</span> About
        </motion.h2>
        <motion.p
          className="about__bio"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealViewport}
        >
          {bio}
        </motion.p>
        {location && <p className="about__loc">📍 {location}</p>}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement `Skills.tsx`**

Create `src/components/standard/Skills.tsx`:
```tsx
import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { fadeUp, staggerContainer, revealViewport } from '../../lib/motion';

const GROUPS: { key: 'languages' | 'frameworks' | 'tools'; label: string }[] = [
  { key: 'languages', label: 'Languages' },
  { key: 'frameworks', label: 'Frameworks' },
  { key: 'tools', label: 'Tools' },
];

export function Skills() {
  return (
    <section id="skills" className="section">
      <div className="container">
        <h2 className="section__title"><span>02.</span> Skills</h2>
        <div className="skills__grid">
          {GROUPS.map((g) => (
            <motion.div
              key={g.key}
              className="skills__group"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={revealViewport}
            >
              <h3 className="skills__label">{g.label}</h3>
              <ul className="skills__list">
                {content.skills[g.key].map((s) => (
                  <motion.li key={s} className="skill-chip" variants={fadeUp}>{s}</motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Implement `Experience.tsx`**

Create `src/components/standard/Experience.tsx`:
```tsx
import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { fadeUp, revealViewport } from '../../lib/motion';

export function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <h2 className="section__title"><span>03.</span> Experience</h2>
        <div className="timeline">
          {content.experience.map((e, i) => (
            <motion.div
              key={`${e.org}-${i}`}
              className="timeline__item"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={revealViewport}
            >
              <div className="timeline__dot" aria-hidden="true" />
              <div className="timeline__body">
                <h3 className="timeline__role">{e.role} <span>· {e.org}</span></h3>
                <p className="timeline__period">{e.period}</p>
                <ul className="timeline__points">
                  {e.points.map((p, j) => <li key={j}>{p}</li>)}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Add section CSS**

Append to `src/components/standard/standard.css`:
```css
/* About */
.about__bio { font-size: 18px; color: var(--fg); max-width: 720px; line-height: 1.7; }
.about__loc { color: var(--muted); margin-top: 16px; font-family: var(--font-mono); font-size: 14px; }

/* Skills */
.skills__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.skills__label { color: var(--accent); font-family: var(--font-mono); font-size: 14px; margin: 0 0 12px; }
.skills__list { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 10px; }
.skill-chip {
  background: var(--bg-elev); border: 1px solid var(--border);
  border-radius: 10px; padding: 8px 12px; font-size: 14px;
}
@media (max-width: 720px) { .skills__grid { grid-template-columns: 1fr; } }

/* Experience timeline */
.timeline { position: relative; padding-left: 28px; }
.timeline::before {
  content: ''; position: absolute; left: 7px; top: 4px; bottom: 4px;
  width: 2px; background: var(--border);
}
.timeline__item { position: relative; padding-bottom: 32px; }
.timeline__dot {
  position: absolute; left: -28px; top: 6px; width: 14px; height: 14px;
  border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px var(--bg);
}
.timeline__role { margin: 0; font-size: 18px; }
.timeline__role span { color: var(--muted); font-weight: 400; }
.timeline__period { color: var(--accent); font-family: var(--font-mono); font-size: 13px; margin: 4px 0 8px; }
.timeline__points { margin: 0; padding-left: 18px; color: var(--muted); line-height: 1.6; }
```

- [ ] **Step 7: Mount sections in `StandardSite.tsx`**

Update `src/components/standard/StandardSite.tsx` to import and render the new sections after `<Hero/>`:
```tsx
import { Nav } from './Nav';
import { Hero } from './Hero';
import { About } from './About';
import { Skills } from './Skills';
import { Experience } from './Experience';
import './standard.css';

export function StandardSite({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  return (
    <>
      <Nav onOpenTerminal={onOpenTerminal} />
      <main>
        <Hero onOpenTerminal={onOpenTerminal} />
        <About />
        {/* Projects added in Task 12 */}
        <Skills />
        <Experience />
        {/* Contact + Footer added in Task 12 */}
      </main>
    </>
  );
}
```

- [ ] **Step 8: Run tests + build**

Run: `npm test -- sections && npm run build`
Expected: section tests pass, build clean.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: about, skills, and experience sections"
```

---

### Task 12: Standard sections — Projects, Contact, Footer

**Files:**
- Create: `src/components/standard/ProjectCard.tsx`, `src/components/standard/Projects.tsx`, `src/components/standard/Contact.tsx`, `src/components/standard/Footer.tsx`
- Modify: `src/components/standard/StandardSite.tsx`, `src/components/standard/standard.css`
- Test: `src/components/standard/projects.test.tsx`

**Interfaces:**
- Consumes: `content`, `Project` type, motion variants, Framer Motion.
- Produces: `Projects`, `ProjectCard({ project }: { project: Project })`, `Contact`, `Footer`.

- [ ] **Step 1: Write the failing test**

Create `src/components/standard/projects.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Projects } from './Projects';
import { Contact } from './Contact';
import { content } from '../../data/content';

describe('Projects', () => {
  it('renders a card per project with its stack', () => {
    render(<Projects />);
    for (const p of content.projects) {
      const heading = screen.getByRole('heading', { name: new RegExp(p.name, 'i') });
      expect(heading).toBeInTheDocument();
    }
    // first project's first stack tag appears
    expect(screen.getAllByText(content.projects[0].stack[0]).length).toBeGreaterThan(0);
  });
});

describe('Contact', () => {
  it('renders a mailto link', () => {
    render(<Contact />);
    const link = screen.getByRole('link', { name: new RegExp(content.socials.email, 'i') });
    expect(link).toHaveAttribute('href', `mailto:${content.socials.email}`);
  });
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `npm test -- projects`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `ProjectCard.tsx`**

Create `src/components/standard/ProjectCard.tsx`:
```tsx
import { motion } from 'framer-motion';
import type { Project } from '../../data/content';
import { fadeUp } from '../../lib/motion';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.article className="card" variants={fadeUp}>
      <div className="card__top">
        <span className="card__folder" aria-hidden="true">▢</span>
        <div className="card__links">
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} source code`}>code</a>
          )}
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} live demo`}>live</a>
          )}
        </div>
      </div>
      <h3 className="card__title">{project.name}</h3>
      <p className="card__summary">{project.summary}</p>
      <ul className="card__stack">
        {project.stack.map((s) => <li key={s}>{s}</li>)}
      </ul>
    </motion.article>
  );
}
```

- [ ] **Step 4: Implement `Projects.tsx`**

Create `src/components/standard/Projects.tsx`:
```tsx
import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { ProjectCard } from './ProjectCard';
import { staggerContainer, revealViewport } from '../../lib/motion';

export function Projects() {
  return (
    <section id="projects" className="section">
      <div className="container">
        <h2 className="section__title"><span>04.</span> Projects</h2>
        <p className="section__lead">A selection of things I&apos;ve designed and built.</p>
        <motion.div
          className="cards"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={revealViewport}
        >
          {content.projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Implement `Contact.tsx`**

Create `src/components/standard/Contact.tsx`:
```tsx
import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { fadeUp, revealViewport } from '../../lib/motion';

export function Contact() {
  const { email, github, linkedin } = content.socials;
  return (
    <section id="contact" className="section section--contact">
      <div className="container">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
          <p className="contact__eyebrow">05. What&apos;s next?</p>
          <h2 className="contact__title">Get in touch</h2>
          <p className="contact__lead">
            I&apos;m open to junior front-end roles and interesting projects. The fastest way to
            reach me is email — I&apos;ll get back to you.
          </p>
          <a className="btn btn--primary" href={`mailto:${email}`}>{email}</a>
          <div className="contact__socials">
            {github && <a href={github} target="_blank" rel="noopener noreferrer">GitHub</a>}
            {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Implement `Footer.tsx`**

Create `src/components/standard/Footer.tsx`:
```tsx
import { content } from '../../data/content';

export function Footer({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>© {new Date().getFullYear()} {content.profile.name}</span>
        <span className="footer__built">
          Built with React &amp; TypeScript ·{' '}
          <button type="button" className="footer__term" onClick={onOpenTerminal}>try the terminal</button>
        </span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: Add CSS for cards, contact, footer**

Append to `src/components/standard/standard.css`:
```css
/* Projects */
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
@media (max-width: 900px) { .cards { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .cards { grid-template-columns: 1fr; } }
.card {
  background: var(--bg-elev); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 22px;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}
.card:hover {
  transform: translateY(-6px);
  border-color: var(--accent);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
}
.card__top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.card__folder { color: var(--accent); font-size: 22px; }
.card__links { display: flex; gap: 12px; font-family: var(--font-mono); font-size: 13px; }
.card__title { margin: 0 0 8px; font-size: 20px; }
.card__summary { color: var(--muted); line-height: 1.6; margin: 0 0 16px; }
.card__stack { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.card__stack li { font-family: var(--font-mono); font-size: 12px; color: var(--muted); }

/* Contact */
.section--contact { text-align: center; padding: 120px 0; }
.contact__eyebrow { color: var(--accent); font-family: var(--font-mono); margin: 0 0 10px; }
.contact__title { font-size: clamp(32px, 6vw, 56px); margin: 0 0 16px; }
.contact__lead { color: var(--muted); max-width: 540px; margin: 0 auto 28px; line-height: 1.7; }
.contact__socials { display: flex; gap: 20px; justify-content: center; margin-top: 22px; font-family: var(--font-mono); font-size: 14px; }

/* Footer */
.footer { border-top: 1px solid var(--border); padding: 28px 0; }
.footer__inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; color: var(--muted); font-size: 13px; font-family: var(--font-mono); }
.footer__term { background: none; border: none; color: var(--accent); cursor: pointer; font-family: var(--font-mono); font-size: 13px; }
```

- [ ] **Step 8: Mount remaining sections in `StandardSite.tsx`**

Update `src/components/standard/StandardSite.tsx` to its final form:
```tsx
import { Nav } from './Nav';
import { Hero } from './Hero';
import { About } from './About';
import { Projects } from './Projects';
import { Skills } from './Skills';
import { Experience } from './Experience';
import { Contact } from './Contact';
import { Footer } from './Footer';
import './standard.css';

export function StandardSite({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  return (
    <>
      <Nav onOpenTerminal={onOpenTerminal} />
      <main>
        <Hero onOpenTerminal={onOpenTerminal} />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <Footer onOpenTerminal={onOpenTerminal} />
    </>
  );
}
```

- [ ] **Step 9: Run tests + build**

Run: `npm test && npm run build`
Expected: every test passes, build clean.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: projects, contact, and footer sections"
```

---

### Task 13: Accessibility & responsive polish

**Files:**
- Modify: `src/components/terminal/Terminal.tsx`, `src/styles/globals.css`, `index.html`
- Test: `src/components/terminal/a11y.test.tsx`

**Interfaces:**
- Consumes: existing components.
- Produces: focus-trap/restore on the terminal overlay, a skip link, accurate `<title>`/meta. No new public API.

- [ ] **Step 1: Write the failing test (focus restore)**

Create `src/components/terminal/a11y.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Terminal } from './Terminal';

describe('terminal a11y', () => {
  it('is a labelled modal dialog', () => {
    render(<Terminal onExit={vi.fn()} />);
    const dialog = screen.getByRole('dialog', { name: /interactive terminal/i });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
  it('Escape inside the input exits', async () => {
    const onExit = vi.fn();
    render(<Terminal onExit={onExit} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });
    input.focus();
    await userEvent.keyboard('{Escape}');
    expect(onExit).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it, expect PASS or FAIL**

Run: `npm test -- a11y`
Expected: the dialog test passes (already labelled); the Escape test passes (already handled in Task 7). If both pass, this confirms behavior — proceed to polish. If any fail, fix `Terminal.tsx` accordingly.

- [ ] **Step 3: Add focus restore to the toggle on close**

In `src/components/terminal/Terminal.tsx`, add a `useEffect` that records the previously focused element on mount and restores it on unmount. Insert after the existing focus effect:
```tsx
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    return () => previouslyFocused?.focus?.();
  }, []);
```

- [ ] **Step 4: Add a skip link and landmark to `globals.css` + `App`**

Append to `src/styles/globals.css`:
```css
.skip-link {
  position: absolute; left: -999px; top: 0; z-index: 200;
  background: var(--accent); color: #06231f; padding: 10px 14px; border-radius: 8px;
}
.skip-link:focus { left: 12px; top: 12px; }
```
In `src/components/standard/StandardSite.tsx`, add as the first child inside the fragment:
```tsx
      <a className="skip-link" href="#projects">Skip to content</a>
```

- [ ] **Step 5: Improve document metadata in `index.html`**

In `index.html` `<head>`, replace `<title>Portfolio</title>` and add meta (use a real description; the name is a placeholder the owner edits):
```html
<title>Your Name — Front-end Developer</title>
<meta name="description" content="Portfolio of a front-end developer — projects, skills, and an interactive terminal." />
<meta name="color-scheme" content="dark" />
```

- [ ] **Step 6: Run the suite + build**

Run: `npm test && npm run build`
Expected: all pass, build clean.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: accessibility polish — focus restore, skip link, metadata"
```

---

### Task 14: README & deployment config

**Files:**
- Create: `README.md`, `public/_redirects` (Netlify SPA fallback), `vercel.json`
- Modify: none

**Interfaces:**
- Consumes: the finished app.
- Produces: documentation + host configs. No code API.

- [ ] **Step 1: Write `README.md`**

Create `README.md`:
````markdown
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
`resume`, `whoami`, `ls`, `cat <file>`, `open <slug>`, `echo`, `history`,
`clear`, `exit`. Tab completes; ↑/↓ recall history.
````

- [ ] **Step 2: Add Netlify SPA fallback**

Create `public/_redirects`:
```
/*    /index.html   200
```

- [ ] **Step 3: Add Vercel config**

Create `vercel.json`:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 4: Final verification — full suite + production build + preview**

Run:
```bash
npm test && npm run build && npm run preview -- --port 4173 &
sleep 2 && curl -sI http://localhost:4173 | head -1
```
Expected: tests pass, build succeeds, `curl` returns `HTTP/1.1 200 OK`. Stop the preview server afterward.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: add README and deployment configuration"
```

---

## Self-Review

**Spec coverage check (spec → task):**

- Stack React+Vite+TS → Task 1. ✓
- Single source of truth `content.ts` → Task 2; consumed everywhere. ✓
- Mode architecture (standard default, terminal overlay) → Task 8 (`useMode`, App). ✓
- Toggle: floating button + backtick + Esc + `#terminal` hash + localStorage → Tasks 8, 10 (nav button), 7 (Esc in terminal). ✓
- Terminal commands (help/about/projects/skills/experience/contact/social/resume/whoami/ls/cat/open/echo/clear/exit/sudo) → Tasks 3–5. ✓
- History + tab-completion + unknown-command suggestion → Tasks 3 (suggest), 6 (history/complete). ✓
- Authentic terminal look (prompt, blinking caret, intro, title bar) → Task 7. ✓
- Mobile command chips → Task 7. ✓
- Standard sections (Hero/About/Projects/Skills/Experience/Contact/Footer + Nav) → Tasks 10–12. ✓
- Signature animations (aurora hero, scroll-reveal, card hover) → Tasks 9–12. ✓
- `prefers-reduced-motion` honored → Task 1 (CSS), Task 9 (hook), applied in Hero (Task 10). ✓
- Accessibility & responsive (semantic landmarks, focus, skip link, contrast, responsive grids) → Tasks 10–13. ✓
- Testing focus on interpreter + hooks → Tasks 3–6, plus component smoke tests. ✓
- Deployment config + README → Task 14. ✓

**Placeholder scan:** No "TBD/TODO/implement later". The only intentional placeholders are the *content values* in `content.ts`, which are the product's editable data, not plan gaps.

**Type consistency:**
- `OutputLine`, `CommandContext`, `CommandHandler`, `Command` defined in Task 3 `types.ts`, used unchanged in Tasks 4–7.
- `runCommand`, `registry`, `commandNames`, `argCandidates`, `refreshCommandNames` names consistent across Tasks 3–6.
- `ScrollbackEntry`/`useTerminal` shape defined in Task 6, consumed in Task 7.
- `useMode` returns `{ mode, open, close }` (Task 8), used by `App` (Tasks 8, 10, 12).
- `StandardSite({ onOpenTerminal })`, `Hero({ onOpenTerminal })`, `Footer({ onOpenTerminal })` props consistent across Tasks 10–12.
- `Project`/`Content` types from Task 2 used in `ProjectCard` (Task 12) and `vfs`/commands (Tasks 4–5).

One naming note resolved: `commandNames` is exported empty in Task 3 then filled by `refreshCommandNames()` which is called at module load after every `register(...)`; the final call lives at the bottom of `commands.ts` after the Task 5 registrations. The `useTerminal` completion logic reads `commandNames` at call time (runtime), so ordering is safe.
