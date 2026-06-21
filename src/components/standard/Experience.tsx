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
