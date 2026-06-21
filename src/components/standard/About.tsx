import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { fadeUp, revealViewport } from '../../lib/motion';

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
