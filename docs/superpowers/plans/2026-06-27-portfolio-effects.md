# Portfolio Effects v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add nine coordinated motion/interaction effects to the standard site — focused on the home (hero) and contact slides — plus a persistent WebGL background, a slide pager, and global click feedback.

**Architecture:** One fixed `LiquidEther` (raw three.js, imperative) canvas sits behind all transparent snap-sections (`z-index:-1`), independent of the scrolling slides. The hero and contact slides gain bespoke + vendored reactbits effects. Every effect is gated by the existing `usePrefersReducedMotion` hook so reduced-motion users get a static, WebGL-free experience.

**Tech Stack:** React 19, Vite, TypeScript (strict, `tsc -b` gate), Vitest + Testing Library (jsdom), hand-written CSS tokens, vendored reactbits (`motion/react`), three.js (new, lazy-loaded).

## Global Constraints

- **Single source of truth:** all profile/socials/skills data comes from `src/data/content.ts`. Do not hardcode personal data in components.
- **Reduced motion:** every animation MUST be disabled/static under `prefers-reduced-motion: reduce`, gated via `usePrefersReducedMotion()` (`src/hooks/usePrefersReducedMotion.ts`) or CSS `@media (prefers-reduced-motion: reduce)`.
- **Type-check gate:** `npm run build` runs `tsc -b` in strict mode with `noUnusedLocals`/`noUnusedParameters`. Unused vars fail the build. There is no separate lint.
- **Test gate:** `npm test` (vitest run) must pass.
- **Dependency rule:** three.js is allowed ONLY imperatively (`import * as THREE`). Do NOT introduce `@react-three/fiber`/`@react-three/drei` (their JSX augmentation breaks React 19 intrinsics under `tsc -b`).
- **Browser-gate:** vendored reactbits ts-tailwind ports can render broken despite a green build/tests — visually verify LiquidEther, LogoLoop, ClickSpark, TiltedCard, StarBorder in a browser before final commit (see Task 11).
- **Accent color:** teal `--accent` = `#5eead4`; secondary `--accent-2` ≈ `#818cf8`; body bg `--bg` = `#0b0f17` (dark-only site).
- **Token namespaces:** never redefine bare CSS tokens (`--muted`, `--accent`) to shadcn semantics; new component CSS lives in `src/components/standard/standard.css`.

---

## File Structure

**New files:**
- `src/components/reactbits/ClickSpark.tsx` — vendored spark-on-click canvas wrapper.
- `src/components/reactbits/LogoLoop.tsx` — vendored marquee.
- `src/components/reactbits/LiquidEther.tsx` + `LiquidEther.css` — vendored three.js fluid background (fetched + TS-adapted).
- `src/components/standard/LiquidBackground.tsx` — fixed, faint, lazy wrapper around LiquidEther; reduced-motion → null.
- `src/components/standard/SlidePager.tsx` — hover/focus-revealed prev/next section buttons.
- `src/components/standard/Typewriter.tsx` — bespoke type-once effect (no gsap).
- `src/components/standard/Spotlight.tsx` — bespoke cursor-follow radial highlight wrapper.
- `src/components/standard/techLogos.tsx` — `LogoItem[]` of inline tech SVGs for LogoLoop.
- Test files co-located: `SlidePager.test.tsx`, `Typewriter.test.tsx`, `LiquidBackground.test.tsx`, `Spotlight.test.tsx`, `techLogos.test.ts`.

**Modified files:**
- `package.json` — add `three`, promote `motion` to dependencies.
- `src/components/standard/StandardSite.tsx` — mount LiquidBackground, ClickSpark, SlidePager.
- `src/components/standard/Hero.tsx` — Typewriter name, StarBorder + Spotlight CTAs, TiltedCard portrait, LogoLoop, remove aurora.
- `src/components/standard/About.tsx` — TiltedCard portrait.
- `src/components/standard/Lightbox.tsx` — fade-scale when no `layoutId`.
- `src/components/standard/Contact.tsx` — (no JSX change; styling via CSS).
- `src/components/standard/standard.css` — all new component styles; remove `.hero__aurora`.
- `src/components/standard/Hero.test.tsx` — update for new hero structure.

---

## Task 1: Dependencies + vendor ClickSpark & LogoLoop

**Files:**
- Modify: `package.json`
- Create: `src/components/reactbits/ClickSpark.tsx`
- Create: `src/components/reactbits/LogoLoop.tsx`

**Interfaces:**
- Produces: `ClickSpark` (default export) props `{ sparkColor?, sparkSize?, sparkRadius?, sparkCount?, duration?, easing?, extraScale?, children? }`; `LogoLoop` (default + named export) with exported `LogoItem` / `LogoLoopProps` types.

- [ ] **Step 1: Add `three`, promote `motion`.** Edit `package.json`: add `"three": "^0.180.0"` to `dependencies`; remove `"motion": "^12.42.0"` from `devDependencies` and add it to `dependencies` (keep alphabetical-ish order). Leave `gsap` and `ogl` in `devDependencies` (unused by production).

- [ ] **Step 2: Install.** Run: `npm install`
  Expected: completes; `node_modules/three` and `node_modules/motion` present. three ships its own types (no `@types/three` needed).

- [ ] **Step 3: Vendor ClickSpark.** Create `src/components/reactbits/ClickSpark.tsx` with the exact ts-tailwind source (imports only `react`):

```tsx
import React, { useRef, useEffect, useCallback } from 'react';

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  extraScale?: number;
  children?: React.ReactNode;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

const ClickSpark: React.FC<ClickSparkProps> = ({
  sparkColor = '#fff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  children
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const resizeCanvas = () => {
      const { width, height } = parent.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(parent);
    resizeCanvas();
    return () => {
      ro.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, []);

  const easeFunc = useCallback(
    (t: number) => {
      switch (easing) {
        case 'linear':
          return t;
        case 'ease-in':
          return t * t;
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    const draw = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparksRef.current = sparksRef.current.filter((spark: Spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;
        const progress = elapsed / duration;
        const eased = easeFunc(progress);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);
        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return true;
      });
      animationId = requestAnimationFrame(draw);
    };
    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easeFunc, extraScale]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();
    const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now
    }));
    sparksRef.current.push(...newSparks);
  };

  return (
    <div className="relative w-full h-full" onClick={handleClick}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      {children}
    </div>
  );
};

export default ClickSpark;
```

- [ ] **Step 4: Vendor LogoLoop.** Create `src/components/reactbits/LogoLoop.tsx` with the exact ts-tailwind source (imports only `react`). Copy it verbatim from the reactbits ts-tailwind variant — it exports `type LogoItem`, `interface LogoLoopProps`, and `default`/named `LogoLoop`. (The full source was retrieved during planning; paste it unmodified. It already reads `prefers-reduced-motion` internally and uses `motion-reduce:` Tailwind variants.)

- [ ] **Step 5: Verify build.** Run: `npm run build`
  Expected: PASS (tsc clean, vite build succeeds). If `noUnusedLocals` flags anything in the pasted sources, remove the unused symbol (do not add `// @ts-ignore`).

- [ ] **Step 6: Commit.**
```bash
git add package.json package-lock.json src/components/reactbits/ClickSpark.tsx src/components/reactbits/LogoLoop.tsx
git commit -m "feat(deps): add three, promote motion; vendor ClickSpark + LogoLoop"
```

---

## Task 2: Vendor LiquidEther (three.js)

**Files:**
- Create: `src/components/reactbits/LiquidEther.tsx`
- Create: `src/components/reactbits/LiquidEther.css`

**Interfaces:**
- Produces: `LiquidEther` (default export) with props (all optional): `mouseForce`, `cursorSize`, `isViscous`, `viscous`, `iterationsViscous`, `iterationsPoisson`, `dt`, `BFECC`, `resolution`, `isBounce`, `colors: string[]`, `style: React.CSSProperties`, `className: string`, `autoDemo`, `autoSpeed`, `autoIntensity`, `takeoverDuration`, `autoResumeDelay`, `autoRampDuration`.

- [ ] **Step 1: Fetch the source.** Download both files from the reactbits repo:
  - `https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/Backgrounds/LiquidEther/LiquidEther.jsx`
  - `https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/Backgrounds/LiquidEther/LiquidEther.css`
  Save the CSS verbatim to `src/components/reactbits/LiquidEther.css`.

- [ ] **Step 2: Adapt JSX → strict TSX.** Save the JS as `src/components/reactbits/LiquidEther.tsx` with these adaptations:
  - Keep `import * as THREE from 'three';` and `import './LiquidEther.css';`. Keep `import { useEffect, useRef } from 'react';`.
  - Add a `LiquidEtherProps` interface (the props above) and type the component signature: `export default function LiquidEther(props: LiquidEtherProps) { ... }` with the existing destructure + defaults (`colors = ['#5227FF', '#FF9FFC', '#B497CF']`, `resolution = 0.5`, etc.).
  - Type the container ref: `const mountRef = useRef<HTMLDivElement>(null);` (match the existing ref name).
  - The imperative WebGL internals use classes/locals — give the minimal typing needed to satisfy strict mode: annotate function params that TS can't infer with explicit types or `any`; remove any genuinely unused locals to satisfy `noUnusedLocals`. Do NOT use `@react-three/fiber`.
  - Ensure the returned root div forwards `className` and `style` props: `<div ref={mountRef} className={className} style={style} />`.

- [ ] **Step 3: Verify build.** Run: `npm run build`
  Expected: PASS. Iterate on TS errors until clean (typical fixes: add `any` on shader/uniform locals, remove unused vars, cast `renderer.domElement`).

- [ ] **Step 4: Commit.**
```bash
git add src/components/reactbits/LiquidEther.tsx src/components/reactbits/LiquidEther.css
git commit -m "feat(reactbits): vendor LiquidEther (imperative three.js, strict-TS adapted)"
```

---

## Task 3: LiquidBackground wrapper (fixed, faint, lazy, reduced-motion)

**Files:**
- Create: `src/components/standard/LiquidBackground.tsx`
- Create: `src/components/standard/LiquidBackground.test.tsx`
- Modify: `src/components/standard/standard.css`

**Interfaces:**
- Consumes: `LiquidEther` default export (Task 2), `usePrefersReducedMotion`.
- Produces: `LiquidBackground` (named export), no props. Renders a `data-testid="liquid-bg"` fixed container when motion is allowed, else `null`.

- [ ] **Step 1: Write the failing test.** Create `src/components/standard/LiquidBackground.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { LiquidBackground } from './LiquidBackground';

function setReducedMotion(reduced: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: reduced,
    media: q,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('LiquidBackground', () => {
  it('renders a fixed background container when motion is allowed', () => {
    setReducedMotion(false);
    render(<LiquidBackground />);
    expect(screen.getByTestId('liquid-bg')).toBeInTheDocument();
  });

  it('renders nothing under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(<LiquidBackground />);
    expect(screen.queryByTestId('liquid-bg')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run to verify it fails.** Run: `npx vitest run src/components/standard/LiquidBackground.test.tsx`
  Expected: FAIL — cannot find module `./LiquidBackground`.

- [ ] **Step 3: Implement.** Create `src/components/standard/LiquidBackground.tsx`:

```tsx
import { lazy, Suspense } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const LiquidEther = lazy(() => import('../reactbits/LiquidEther'));

/** One faint, fixed WebGL fluid layer behind every slide. Lazy-loads three.js so
 *  it is code-split out of the main bundle, and renders nothing under reduced motion. */
export function LiquidBackground() {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;
  return (
    <div className="liquid-bg" aria-hidden="true" data-testid="liquid-bg">
      <Suspense fallback={null}>
        <LiquidEther
          colors={['#0b2e2a', '#5eead4', '#818cf8']}
          resolution={0.4}
          autoIntensity={1.6}
          autoSpeed={0.4}
          style={{ width: '100%', height: '100%' }}
        />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 4: Add CSS.** Append to `src/components/standard/standard.css`:

```css
/* Faint fixed WebGL background — sits behind all transparent snap-sections. */
.liquid-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.3;
}
```

- [ ] **Step 5: Run tests.** Run: `npx vitest run src/components/standard/LiquidBackground.test.tsx`
  Expected: PASS (both cases). The lazy LiquidEther never resolves synchronously, so three.js is not instantiated in jsdom.

- [ ] **Step 6: Commit.**
```bash
git add src/components/standard/LiquidBackground.tsx src/components/standard/LiquidBackground.test.tsx src/components/standard/standard.css
git commit -m "feat(standard): faint fixed LiquidEther background (lazy, reduced-motion aware)"
```

---

## Task 4: SlidePager (hover/focus-revealed prev/next)

**Files:**
- Create: `src/components/standard/SlidePager.tsx`
- Create: `src/components/standard/SlidePager.test.tsx`
- Modify: `src/components/standard/standard.css`

**Interfaces:**
- Consumes: `usePrefersReducedMotion`.
- Produces: `SlidePager` (named export), no props. Queries `main > section`, tracks the active one via `IntersectionObserver`, scrolls to neighbors. Buttons labeled "Previous section" / "Next section".

- [ ] **Step 1: Write the failing test.** Create `src/components/standard/SlidePager.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SlidePager } from './SlidePager';

function renderWithSections() {
  return render(
    <>
      <main>
        <section id="home" />
        <section id="about" />
        <section id="contact" />
      </main>
      <SlidePager />
    </>
  );
}

describe('SlidePager', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('hides the previous button on the first slide and shows next', () => {
    renderWithSections();
    expect(screen.getByLabelText('Previous section')).not.toBeVisible();
    expect(screen.getByLabelText('Next section')).toBeInTheDocument();
  });

  it('scrolls to the next section when next is clicked', async () => {
    renderWithSections();
    await userEvent.click(screen.getByLabelText('Next section'));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify it fails.** Run: `npx vitest run src/components/standard/SlidePager.test.tsx`
  Expected: FAIL — cannot find module `./SlidePager`.

- [ ] **Step 3: Implement.** Create `src/components/standard/SlidePager.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const Chevron = ({ up }: { up: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d={up ? 'M5 12L10 7L15 12' : 'M5 8L10 13L15 8'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Hover/focus-revealed prev/next slide nav on the right edge. Tracks the active
 *  snap-section with IntersectionObserver and scrolls to its neighbours. */
export function SlidePager() {
  const reduced = usePrefersReducedMotion();
  const [sections, setSections] = useState<HTMLElement[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('main > section'));
    setSections(els);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = els.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { threshold: 0.5 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (idx: number) => {
    sections[idx]?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };

  const hasPrev = active > 0;
  const hasNext = active < sections.length - 1;

  return (
    <div className="slide-pager">
      <button
        type="button"
        className="slide-pager__btn"
        aria-label="Previous section"
        onClick={() => go(active - 1)}
        disabled={!hasPrev}
        hidden={!hasPrev}
      >
        <Chevron up />
      </button>
      <button
        type="button"
        className="slide-pager__btn"
        aria-label="Next section"
        onClick={() => go(active + 1)}
        disabled={!hasNext}
        hidden={!hasNext}
      >
        <Chevron up={false} />
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Add CSS.** Append to `src/components/standard/standard.css`:

```css
/* Slide pager — right-edge prev/next, revealed on hover of the zone or keyboard
   focus. Coexists with .back-to-top (bottom-right). */
.slide-pager {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 45;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px 16px 44px; /* left pad widens the hover catch toward content */
}
.slide-pager__btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  color: var(--accent);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  opacity: 0;
  transform: translateX(8px);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease, border-color 0.15s ease;
}
.slide-pager:hover .slide-pager__btn,
.slide-pager:focus-within .slide-pager__btn {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}
.slide-pager__btn:hover { border-color: var(--accent); }
.slide-pager__btn[hidden] { display: none; }
@media (max-width: 640px) {
  .slide-pager { display: none; } /* native snap + swipe suffices on touch */
}
@media (prefers-reduced-motion: reduce) {
  .slide-pager__btn { transition: none; }
}
```

- [ ] **Step 5: Run tests.** Run: `npx vitest run src/components/standard/SlidePager.test.tsx`
  Expected: PASS. (`not.toBeVisible()` passes because the first-slide prev button has `hidden`; the IntersectionObserver stub in `src/test/setup.ts` never fires, so `active` stays 0.)

- [ ] **Step 6: Commit.**
```bash
git add src/components/standard/SlidePager.tsx src/components/standard/SlidePager.test.tsx src/components/standard/standard.css
git commit -m "feat(standard): hover/focus-revealed up/down SlidePager"
```

---

## Task 5: Typewriter (type-once name, a11y-safe, no gsap)

**Files:**
- Create: `src/components/standard/Typewriter.tsx`
- Create: `src/components/standard/Typewriter.test.tsx`
- Modify: `src/components/standard/standard.css`

**Interfaces:**
- Consumes: `usePrefersReducedMotion`.
- Produces: `Typewriter` (named export) props `{ text: string; speed?: number; startDelay?: number; className?: string }`. Renders an `aria-hidden` span that types `text` once with a blinking caret; under reduced motion it shows the full text immediately.

- [ ] **Step 1: Write the failing test.** Create `src/components/standard/Typewriter.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { Typewriter } from './Typewriter';

function setReducedMotion(reduced: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: reduced,
    media: q,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('Typewriter', () => {
  it('shows the full text immediately under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(<Typewriter text="Ada Lovelace" />);
    expect(container.textContent).toContain('Ada Lovelace');
  });

  it('marks the typed content aria-hidden (the real name lives on the parent)', () => {
    setReducedMotion(true);
    const { container } = render(<Typewriter text="Ada Lovelace" />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails.** Run: `npx vitest run src/components/standard/Typewriter.test.tsx`
  Expected: FAIL — cannot find module `./Typewriter`.

- [ ] **Step 3: Implement.** Create `src/components/standard/Typewriter.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface TypewriterProps {
  text: string;
  speed?: number; // ms per character
  startDelay?: number; // ms before typing starts
  className?: string;
}

/** Types `text` once, then rests with a blinking caret. The typed span is
 *  aria-hidden — wrap it in an element that carries the real accessible name. */
export function Typewriter({ text, speed = 70, startDelay = 300, className }: TypewriterProps) {
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(reduced ? text.length : 0);

  useEffect(() => {
    if (reduced) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let i = 0;
    let stepTimer: ReturnType<typeof setTimeout>;
    const startTimer = setTimeout(function tick() {
      i += 1;
      setCount(i);
      if (i < text.length) stepTimer = setTimeout(tick, speed);
    }, startDelay);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(stepTimer);
    };
  }, [text, speed, startDelay, reduced]);

  const done = count >= text.length;
  return (
    <span className={className} aria-hidden="true">
      {text.slice(0, count)}
      <span className={`typewriter__caret${done ? ' typewriter__caret--rest' : ''}`} />
    </span>
  );
}
```

- [ ] **Step 4: Add caret CSS.** Append to `src/components/standard/standard.css`:

```css
/* Typewriter caret */
.typewriter__caret {
  display: inline-block;
  width: 0.08em;
  height: 1em;
  margin-left: 0.06em;
  background: var(--accent);
  vertical-align: -0.12em;
  animation: caret-blink 1s steps(1) infinite;
}
@keyframes caret-blink {
  50% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .typewriter__caret { animation: none; opacity: 0; }
}
```

- [ ] **Step 5: Run tests.** Run: `npx vitest run src/components/standard/Typewriter.test.tsx`
  Expected: PASS.

- [ ] **Step 6: Commit.**
```bash
git add src/components/standard/Typewriter.tsx src/components/standard/Typewriter.test.tsx src/components/standard/standard.css
git commit -m "feat(standard): bespoke type-once Typewriter (a11y-safe, no gsap)"
```

---

## Task 6: Spotlight wrapper (cursor-follow radial)

**Files:**
- Create: `src/components/standard/Spotlight.tsx`
- Create: `src/components/standard/Spotlight.test.tsx`
- Modify: `src/components/standard/standard.css`

**Interfaces:**
- Produces: `Spotlight` (named export) props `{ children: React.ReactNode; className?: string }` (plus passthrough span attrs). Tracks the pointer via `--mx`/`--my` CSS vars and paints a radial highlight on hover.

- [ ] **Step 1: Write the failing test.** Create `src/components/standard/Spotlight.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { Spotlight } from './Spotlight';

describe('Spotlight', () => {
  it('renders its children inside a .spotlight wrapper', () => {
    render(
      <Spotlight>
        <a href="#projects">View my work</a>
      </Spotlight>
    );
    const link = screen.getByRole('link', { name: 'View my work' });
    expect(link).toBeInTheDocument();
    expect(link.closest('.spotlight')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails.** Run: `npx vitest run src/components/standard/Spotlight.test.tsx`
  Expected: FAIL — cannot find module `./Spotlight`.

- [ ] **Step 3: Implement.** Create `src/components/standard/Spotlight.tsx`:

```tsx
import { useRef } from 'react';

interface SpotlightProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

/** Wraps a control and paints a cursor-following radial highlight on hover via
 *  --mx/--my CSS vars. Disabled under reduced motion (see standard.css). */
export function Spotlight({ children, className = '', ...rest }: SpotlightProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const onMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <span ref={ref} className={`spotlight ${className}`.trim()} onMouseMove={onMove} {...rest}>
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Add CSS.** Append to `src/components/standard/standard.css`:

```css
/* Spotlight — cursor-follow radial highlight over a control. */
.spotlight { position: relative; display: inline-block; border-radius: 12px; }
.spotlight::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  background: radial-gradient(
    120px circle at var(--mx, 50%) var(--my, 50%),
    rgba(94, 234, 212, 0.35),
    transparent 60%
  );
}
.spotlight:hover::before { opacity: 1; }
@media (prefers-reduced-motion: reduce) {
  .spotlight::before { display: none; }
}
```

- [ ] **Step 5: Run tests.** Run: `npx vitest run src/components/standard/Spotlight.test.tsx`
  Expected: PASS.

- [ ] **Step 6: Commit.**
```bash
git add src/components/standard/Spotlight.tsx src/components/standard/Spotlight.test.tsx src/components/standard/standard.css
git commit -m "feat(standard): cursor-follow Spotlight wrapper"
```

---

## Task 7: techLogos data (inline tech SVGs)

**Files:**
- Create: `src/components/standard/techLogos.tsx`
- Create: `src/components/standard/techLogos.test.ts`

**Interfaces:**
- Consumes: `LogoItem` type from `../reactbits/LogoLoop`.
- Produces: `techLogos: LogoItem[]` — node-based logo items, each `{ node: <svg>, title, ariaLabel }`.

- [ ] **Step 1: Write the failing test.** Create `src/components/standard/techLogos.test.ts`:

```ts
import { techLogos } from './techLogos';

describe('techLogos', () => {
  it('exposes at least six logo items', () => {
    expect(techLogos.length).toBeGreaterThanOrEqual(6);
  });

  it('every item is a node-based logo with an accessible label', () => {
    for (const item of techLogos) {
      expect('node' in item).toBe(true);
      // @ts-expect-error narrow at runtime
      expect(item.ariaLabel ?? item.title).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run to verify it fails.** Run: `npx vitest run src/components/standard/techLogos.test.ts`
  Expected: FAIL — cannot find module `./techLogos`.

- [ ] **Step 3: Implement.** Create `src/components/standard/techLogos.tsx`. For each brand below, fetch the official monochrome SVG **path data** from simpleicons.org (e.g. `https://cdn.simpleicons.org/<slug>` or the icon's page) and inline it as a `viewBox="0 0 24 24"` `<svg>` with `fill="currentColor"`. Brands + slugs: React (`react`), TypeScript (`typescript`), JavaScript (`javascript`), Node.js (`nodedotjs`), Vite (`vite`), HTML5 (`html5`), CSS (`css`). Structure:

```tsx
import type { LogoItem } from '../reactbits/LogoLoop';

const icon = (label: string, path: string): LogoItem => ({
  node: (
    <svg
      className="logoloop__icon"
      viewBox="0 0 24 24"
      role="img"
      aria-label={label}
      fill="currentColor"
      height="28"
      width="28"
    >
      <path d={path} />
    </svg>
  ),
  title: label,
  ariaLabel: label,
});

// Replace each "PATH_…" with the real `d` value fetched from simpleicons.org.
export const techLogos: LogoItem[] = [
  icon('React', 'PATH_REACT'),
  icon('TypeScript', 'PATH_TYPESCRIPT'),
  icon('JavaScript', 'PATH_JAVASCRIPT'),
  icon('Node.js', 'PATH_NODEJS'),
  icon('Vite', 'PATH_VITE'),
  icon('HTML5', 'PATH_HTML5'),
  icon('CSS', 'PATH_CSS'),
];
```

  After filling the real path strings, there must be **no** `PATH_…` placeholders left.

- [ ] **Step 4: Add icon tint CSS.** Append to `src/components/standard/standard.css`:

```css
/* LogoLoop tech icons — faint, muted, brighten slightly on hover. */
.logoloop__icon { color: var(--muted); opacity: 0.7; transition: color 0.2s ease, opacity 0.2s ease; }
.logoloop__icon:hover { color: var(--fg); opacity: 1; }
```

- [ ] **Step 5: Run tests + build.** Run: `npx vitest run src/components/standard/techLogos.test.ts && npm run build`
  Expected: PASS (build confirms the JSX/SVG compiles and no placeholders break parsing).

- [ ] **Step 6: Commit.**
```bash
git add src/components/standard/techLogos.tsx src/components/standard/techLogos.test.ts src/components/standard/standard.css
git commit -m "feat(standard): inline tech-logo set for LogoLoop"
```

---

## Task 8: Lightbox fade-scale when no layoutId

**Files:**
- Modify: `src/components/standard/Lightbox.tsx:72-78`

**Interfaces:**
- Produces: unchanged `Lightbox` signature; new behavior — when `layoutId` is omitted (and motion allowed), the image fades + scales in/out instead of morphing.

- [ ] **Step 1: Update the image element.** In `src/components/standard/Lightbox.tsx`, replace the `<motion.img className="lightbox__img" ... />` with:

```tsx
          <motion.img
            className="lightbox__img"
            src={src}
            alt={alt}
            layoutId={reduced ? undefined : layoutId}
            initial={reduced || layoutId ? false : { opacity: 0, scale: 0.92 }}
            animate={reduced || layoutId ? undefined : { opacity: 1, scale: 1 }}
            exit={reduced || layoutId ? undefined : { opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          />
```

- [ ] **Step 2: Verify existing Lightbox tests still pass.** Run: `npx vitest run src/components/standard/Lightbox.test.tsx`
  Expected: PASS (the morph path with `layoutId` is unchanged; the new branch only applies when `layoutId` is absent).

- [ ] **Step 3: Commit.**
```bash
git add src/components/standard/Lightbox.tsx
git commit -m "feat(standard): Lightbox fade-scales when no shared layoutId"
```

---

## Task 9: Hero — Typewriter name, StarBorder + Spotlight CTAs, TiltedCard portrait, LogoLoop, remove aurora

**Files:**
- Modify: `src/components/standard/Hero.tsx`
- Modify: `src/components/standard/Hero.test.tsx`
- Modify: `src/components/standard/standard.css` (remove `.hero__aurora`; add `.hero__logos`, `.hero__starcta`, `.portrait-btn--tilt`)

**Interfaces:**
- Consumes: `Typewriter` (Task 5), `Spotlight` (Task 6), `techLogos` (Task 7), `LogoLoop` (Task 1), `StarBorder` (vendored), `TiltedCard` (vendored), `Lightbox` (Task 8).

- [ ] **Step 1: Update the failing test first.** Replace `src/components/standard/Hero.test.tsx` assertions to match the new structure. The hero must still expose the name as a heading and both CTAs as links:

```tsx
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';
import { content } from '../../data/content';

describe('Hero', () => {
  it('renders the name as a heading via aria-label', () => {
    render(<Hero onOpenTerminal={() => {}} />);
    expect(screen.getByRole('heading', { level: 1, name: content.profile.name })).toBeInTheDocument();
  });

  it('renders both CTAs as links', () => {
    render(<Hero onOpenTerminal={() => {}} />);
    expect(screen.getByRole('link', { name: 'View my work' })).toHaveAttribute('href', '#projects');
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', '#contact');
  });

  it('renders the technologies logo region', () => {
    render(<Hero onOpenTerminal={() => {}} />);
    expect(screen.getByRole('region', { name: /technolog/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails.** Run: `npx vitest run src/components/standard/Hero.test.tsx`
  Expected: FAIL (heading name now comes from `aria-label`; LogoLoop region absent).

- [ ] **Step 3: Implement Hero.** Rewrite `src/components/standard/Hero.tsx`:

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Lightbox } from './Lightbox';
import { Typewriter } from './Typewriter';
import { Spotlight } from './Spotlight';
import { techLogos } from './techLogos';
import StarBorder from '../reactbits/StarBorder';
import TiltedCard from '../reactbits/TiltedCard';
import LogoLoop from '../reactbits/LogoLoop';

export function Hero({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [zoom, setZoom] = useState(false);
  const { name, tagline, portraitUrl } = content.profile;

  return (
    <section id="home" className="hero">
      <div className="container hero__inner">
        <div className="hero__text">
          <motion.p
            className="hero__eyebrow"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Hi, my name is
          </motion.p>
          <h1 className="hero__name" aria-label={name}>
            <Typewriter text={name} />
          </h1>
          <motion.p
            className="hero__tagline"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            {tagline}
          </motion.p>
          <div className="hero__cta">
            <Spotlight>
              <a className="btn btn--primary" href="#projects">View my work</a>
            </Spotlight>
            <StarBorder as="a" href="#contact" color="#5eead4" speed="5s" className="hero__starcta">
              Get in touch
            </StarBorder>
          </div>
          <button type="button" className="hero__hint" onClick={onOpenTerminal}>
            {(() => {
              const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
              const mod = isMac ? '⌘' : 'Ctrl';
              return <>psst — press <kbd className="hero__hint-key">{mod}</kbd> <kbd className="hero__hint-key">K</kbd> for terminal mode</>;
            })()}
          </button>
        </div>
        {portraitUrl && (
          <motion.div
            className="hero__portrait-wrap"
            initial={reduced ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            <button
              type="button"
              className="portrait-btn portrait-btn--tilt"
              onClick={() => setZoom(true)}
              aria-label={`Enlarge portrait of ${name}`}
            >
              <TiltedCard
                imageSrc={portraitUrl}
                altText={`Portrait of ${name}`}
                captionText="Click to enlarge"
                containerHeight="320px"
                containerWidth="320px"
                imageHeight="320px"
                imageWidth="320px"
                rotateAmplitude={12}
                scaleOnHover={1.06}
                showMobileWarning={false}
              />
            </button>
            <Lightbox
              src={portraitUrl}
              alt={`Portrait of ${name}`}
              open={zoom}
              onClose={() => setZoom(false)}
            />
          </motion.div>
        )}
      </div>
      <div className="container hero__logos">
        <LogoLoop
          logos={techLogos}
          speed={40}
          gap={48}
          logoHeight={28}
          fadeOut
          fadeOutColor="#0b0f17"
          ariaLabel="Technologies I work with"
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Update CSS.** In `src/components/standard/standard.css`: (a) delete the `.hero__aurora { … }` rule and the `@keyframes drift { … }` block (lines ~49-60); (b) append:

```css
/* Hero StarBorder CTA — add a teal glow on hover atop StarBorder's own pill. */
.hero__starcta { transition: box-shadow 0.2s ease; }
.hero__starcta:hover { box-shadow: 0 0 24px rgba(94, 234, 212, 0.5); }

/* Hero portrait now hosts a TiltedCard (rounded rect, not a circle). */
.portrait-btn--tilt { border-radius: 16px; }

/* Hero tech-logo marquee at the slide bottom. */
.hero__logos { margin-top: 44px; }
```

- [ ] **Step 5: Run tests.** Run: `npx vitest run src/components/standard/Hero.test.tsx`
  Expected: PASS.

- [ ] **Step 6: Commit.**
```bash
git add src/components/standard/Hero.tsx src/components/standard/Hero.test.tsx src/components/standard/standard.css
git commit -m "feat(hero): typed name, StarBorder + Spotlight CTAs, TiltedCard portrait, LogoLoop; drop aurora"
```

---

## Task 10: About TiltedCard portrait + Contact bracketed links

**Files:**
- Modify: `src/components/standard/About.tsx`
- Modify: `src/components/standard/standard.css` (add `.contact__socials a` bracket styles)

**Interfaces:**
- Consumes: `TiltedCard` (vendored), `Lightbox` (Task 8).

- [ ] **Step 1: Update About to use TiltedCard.** In `src/components/standard/About.tsx`, add `import TiltedCard from '../reactbits/TiltedCard';`, and replace the `<motion.img className="about__portrait" ... />` with:

```tsx
                <TiltedCard
                  imageSrc={portraitUrl}
                  altText={`Portrait of ${name}`}
                  captionText="Click to enlarge"
                  containerHeight="240px"
                  containerWidth="240px"
                  imageHeight="240px"
                  imageWidth="240px"
                  rotateAmplitude={12}
                  scaleOnHover={1.06}
                  showMobileWarning={false}
                />
```

  Then remove `layoutId="portrait-about"` usage: drop the `layoutId` prop from the `<Lightbox … />` call (so it fade-scales). Remove the now-unused `motion` import only if nothing else in the file uses it (the `about__bio`/`section__title` still use `motion.*`, so keep the import).

- [ ] **Step 2: Add Contact bracket CSS.** Append to `src/components/standard/standard.css`:

```css
/* Contact social links — animated [ … ] brackets on hover AND focus. */
.contact__socials a { position: relative; }
.contact__socials a::before,
.contact__socials a::after {
  opacity: 0;
  color: var(--accent);
  transition: opacity 0.2s ease, margin 0.2s ease;
}
.contact__socials a::before { content: '['; margin-right: 0; }
.contact__socials a::after { content: ']'; margin-left: 0; }
.contact__socials a:hover::before,
.contact__socials a:focus-visible::before { opacity: 1; margin-right: 6px; }
.contact__socials a:hover::after,
.contact__socials a:focus-visible::after { opacity: 1; margin-left: 6px; }
@media (prefers-reduced-motion: reduce) {
  .contact__socials a::before,
  .contact__socials a::after { transition: none; }
}
```

- [ ] **Step 3: Run affected tests.** Run: `npx vitest run src/components/standard/About.test.tsx src/components/standard/sections.test.tsx`
  Expected: PASS. If `About.test.tsx` asserts on the old `img.about__portrait`, update it to assert `screen.getByAltText(/Portrait of/)` (TiltedCard renders an `<img>` with the alt text) and that the enlarge button still exists.

- [ ] **Step 4: Commit.**
```bash
git add src/components/standard/About.tsx src/components/standard/standard.css src/components/standard/About.test.tsx
git commit -m "feat(standard): TiltedCard about portrait; bracketed contact links"
```

---

## Task 11: Wire StandardSite (background, ClickSpark, pager) + full verification

**Files:**
- Modify: `src/components/standard/StandardSite.tsx`

**Interfaces:**
- Consumes: `LiquidBackground` (Task 3), `SlidePager` (Task 4), `ClickSpark` (Task 1), `usePrefersReducedMotion`.

- [ ] **Step 1: Rewrite StandardSite.** Replace `src/components/standard/StandardSite.tsx`:

```tsx
import { Nav } from './Nav';
import { Hero } from './Hero';
import { About } from './About';
import { Projects } from './Projects';
import { Skills } from './Skills';
import { Experience } from './Experience';
import { Contact } from './Contact';
import { Footer } from './Footer';
import { BackToTop } from './BackToTop';
import { SlidePager } from './SlidePager';
import { LiquidBackground } from './LiquidBackground';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import ClickSpark from '../reactbits/ClickSpark';
import './standard.css';

export function StandardSite({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const reduced = usePrefersReducedMotion();
  const site = (
    <>
      <a className="skip-link" href="#home">Skip to content</a>
      <Nav onOpenTerminal={onOpenTerminal} />
      <main>
        <Hero onOpenTerminal={onOpenTerminal} />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer onOpenTerminal={onOpenTerminal} />
      <BackToTop />
      <SlidePager />
    </>
  );

  return (
    <>
      <LiquidBackground />
      {reduced ? (
        site
      ) : (
        <ClickSpark sparkColor="#5eead4" sparkRadius={18} sparkCount={10} duration={500}>
          {site}
        </ClickSpark>
      )}
    </>
  );
}
```

- [ ] **Step 2: Run the full test suite.** Run: `npm test`
  Expected: PASS. Likely needing updates: `a11y.test.tsx`, `site-order.test.tsx` — fix any assertion that depended on the old hero heading text node or removed aurora. `site-order` should still pass (section order unchanged). For a11y, the heading still has an accessible name via `aria-label`.

- [ ] **Step 3: Run the type-check + build gate.** Run: `npm run build`
  Expected: PASS (tsc clean; vite build emits `dist/` with three.js code-split into its own chunk).

- [ ] **Step 4: Browser verification (required).** Run: `npm run dev`, open the site, and confirm:
  - Faint liquid background animates behind all slides and scrolls independently of the snap-sections.
  - SlidePager appears on right-edge hover/keyboard-focus; ▲ hidden on home, ▼ hidden on contact; clicking moves one slide.
  - Hero name types out once; StarBorder pill glows on hover; "View my work" shows the cursor spotlight; LogoLoop marquee runs at the hero bottom; clicking the portrait opens the (fade-scale) lightbox and the portrait tilts on hover.
  - Contact GitHub/LinkedIn show `[ … ]` brackets on hover and on keyboard focus.
  - Click anywhere produces teal sparks.
  - Toggle OS reduced-motion: background gone, no sparks, name static, logos parked, pager jumps instantly.
  Fix any port-breakage found (per the reactbits ts-tailwind pitfalls: oversized defaults, keyframe/classname collisions).

- [ ] **Step 5: Commit.**
```bash
git add src/components/standard/StandardSite.tsx
git commit -m "feat(standard): mount LiquidBackground, ClickSpark, SlidePager; full integration"
```

---

## Self-Review (completed during planning)

**Spec coverage:** all 9 spec features map to tasks — background (T2/T3), SlidePager (T4), TiltedCard portraits (T9/T10), StarBorder (T9), Spotlight (T9/T6), bracket links (T10), typed name (T9/T5), ClickSpark (T11/T1), LogoLoop (T9/T7). Dependency moves (T1). Reduced-motion + a11y + browser-gate addressed per task and in T11.

**Deviations from spec (surfaced for user):**
1. **Typed name uses a bespoke `Typewriter`, not reactbits `TextType`** — `TextType` pulls `gsap` into the production bundle just for a blinking cursor. The bespoke component is dependency-free and gives identical behavior with a CSS caret. (`gsap` stays a devDependency.)
2. **LogoLoop logos are inline tech SVGs fetched from simpleicons.org** (no `react-icons` runtime dep), as the spec specified avoiding that dependency.

**Placeholder scan:** the only intentional fill-in is the simple-icons path data in Task 7 (explicit fetch step with source + required "no `PATH_…` left" check). No other placeholders.

**Type consistency:** `LogoItem` (T1 export) consumed by T7/T9; `Typewriter`/`Spotlight`/`SlidePager`/`LiquidBackground` named exports consumed by T9/T11; `ClickSpark`/`TiltedCard`/`StarBorder`/`LiquidEther` default exports. Lightbox signature unchanged (T8 only changes internals).
