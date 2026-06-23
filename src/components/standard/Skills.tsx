import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { fadeUp, staggerContainer, revealViewport } from '../../lib/motion';

// Per-group accent token, driven by data rather than the old :nth-child rules so
// the colour travels with the group. Exposed to CSS as `--c` on the card and
// consumed by Tailwind arbitrary-value utilities (text-[var(--c)],
// [border-top-color:var(--c)]) — the canonical way to do per-instance theming.
const GROUPS: { key: 'languages' | 'frameworks' | 'tools'; label: string; accent: string }[] = [
  { key: 'languages', label: 'Languages', accent: 'var(--accent)' },
  { key: 'frameworks', label: 'Frameworks', accent: 'var(--accent-2)' },
  { key: 'tools', label: 'Tools', accent: 'var(--success)' },
];

export function Skills() {
  return (
    // section scaffold: .section (96px block padding) + .container (centred max-w)
    <section id="skills" className="py-24">
      <div className="mx-auto w-full max-w-[var(--maxw)] px-6">
        {/* fluid title; the mono accent number uses the brand teal (text-primary) */}
        <h2 className="mb-2 text-[clamp(26px,5vw,40px)]">
          <span className="font-mono text-[0.6em] text-primary">04.</span> Skills
        </h2>

        <div className="grid grid-cols-3 gap-5 max-[720px]:grid-cols-1">
          {GROUPS.map((g) => (
            <motion.div
              key={g.key}
              style={{ '--c': g.accent } as CSSProperties}
              className="rounded-lg border border-border border-t-[3px] [border-top-color:var(--c)] bg-card px-[22px] py-5 transition-[transform,box-shadow] duration-[180ms] ease-out hover:-translate-y-1 hover:shadow-[0_16px_36px_rgb(0_0_0/0.3)]"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={revealViewport}
            >
              <h3 className="mb-3.5 border-b border-border pb-2.5 font-mono text-sm text-[var(--c)]">
                {g.label}
              </h3>
              <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
                {content.skills[g.key].map((s) => (
                  <motion.li
                    key={s}
                    variants={fadeUp}
                    className="rounded-[10px] border border-border bg-background px-3 py-2 text-sm transition-[transform,color,background-color,border-color] duration-150 hover:-translate-y-0.5 hover:border-primary hover:bg-card hover:text-foreground motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    {s}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
