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
        <h2 className="section__title"><span>04.</span> Skills</h2>
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
