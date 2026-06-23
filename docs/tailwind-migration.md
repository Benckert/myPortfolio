# Tailwind migration guide

How to migrate a hand-written-CSS component to Tailwind v4 utilities in this repo.
The **`Skills` section** (`src/components/standard/Skills.tsx`) is the reference
migration — read it alongside this guide.

## Philosophy

- **Incremental, not big-bang.** Migrate a component only when you're already
  touching it. Tailwind and the hand-written `.css` files coexist fine.
- **Tokens stay the source of truth.** `src/styles/globals.css` defines the design
  tokens once; Tailwind utilities consume them. Never hard-code hex values.
- **A migrated component owns its styles.** When done, delete that component's
  now-dead rules from the `.css` file (leave *shared* primitives like `.container`,
  `.section__title`, `.btn` until every consumer is migrated).

## Color tokens → utilities

The bare tokens (`--accent`, `--muted`, …) keep their original meaning for the
remaining hand-written CSS. In **Tailwind**, use the `--color-*` utilities, which
`globals.css` maps onto those tokens via `@theme inline`:

| Design token (CSS)         | Role              | Tailwind utility           |
| -------------------------- | ----------------- | -------------------------- |
| `--bg`                     | page background   | `bg-background`            |
| `--bg-elev`                | elevated surface  | `bg-card` (`bg-secondary`) |
| `--fg`                     | primary text      | `text-foreground`          |
| `--muted`                  | secondary text    | `text-muted-foreground`    |
| `--accent` (brand teal)    | accent / brand    | `text-primary` `bg-primary` `border-primary` |
| `--border`                 | hairlines         | `border-border`            |
| `--radius` (14px)          | corner radius     | `rounded-lg`               |
| `--font-mono` (JetBrains)  | mono font         | `font-mono`                |

Tokens **not** in the bridge (`--accent-2`, `--success`, `--maxw`, `--nav-h`) have
no semantic utility — reference them with arbitrary values: `max-w-[var(--maxw)]`,
or via the `--c` pattern below.

> ⚠️ Don't reach for shadcn's *background-role* names by their bare token name.
> `--accent`/`--muted` mean a *brand colour* / *text colour* here, the opposite of
> shadcn's roles. Always go through the `--color-*` utilities in the table.

## Patterns (all shown in `Skills.tsx`)

**Section scaffold** — `.section` + `.container`:
```tsx
<section id="skills" className="py-24">
  <div className="mx-auto w-full max-w-[var(--maxw)] px-6">
```

**Fluid typography** — keep `clamp()` as an arbitrary value:
```tsx
<h2 className="mb-2 text-[clamp(26px,5vw,40px)]">
  <span className="font-mono text-[0.6em] text-primary">04.</span> Skills
</h2>
```

**Per-instance dynamic colour** — replaces `:nth-child` rules. Put the token on a
CSS custom property in `style`, then read it from arbitrary-value utilities so the
colour travels with the data:
```tsx
<div style={{ '--c': g.accent } as CSSProperties}
     className="border-t-[3px] [border-top-color:var(--c)] ...">
  <h3 className="text-[var(--c)] ...">{g.label}</h3>
```

**Framer Motion + Tailwind** — put utilities in `className` on `motion.*`; keep the
`variants`/`initial`/`whileInView` props unchanged:
```tsx
<motion.div className="rounded-lg border border-border ..." variants={staggerContainer} … />
```

**Reduced motion** — use the `motion-reduce:` variant to drop hover transforms
(replaces the old `@media (prefers-reduced-motion)` block for that element):
```tsx
className="... hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
```

## Gotchas learned the hard way

- **Preflight de-bolds headings.** Tailwind's reset sets `h1–h6` to
  `font-weight: inherit`. Headings that relied on the browser default (most of
  `.section__title`, `.card__title`) silently dropped to 400. `globals.css` restores
  `font-weight: 700` for headings in `@layer base` — keep that rule.
- **Decouple tests from styling classes.** `site-order.test.tsx` queried
  `.section__title`; once Skills dropped that class the test broke. It now matches
  `h2` + the numbered-label regex instead. Prefer roles/text/`data-*` over CSS
  classes in tests.

## Checklist

1. Map each rule to utilities using the table above; `clamp()`/odd values →
   `[arbitrary]`; per-instance values → the `--c` pattern.
2. Keep Framer props; move only `className`.
3. Add `motion-reduce:` variants wherever the old CSS had a reduced-motion override.
4. Delete the component's dead rules from the `.css` file (keep shared primitives).
5. Update any test that selected the removed classes.
6. `npm run build` + `npm test`, then verify the section visually (it should be
   pixel-identical).
