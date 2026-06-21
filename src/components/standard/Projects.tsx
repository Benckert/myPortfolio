import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { ProjectCard } from './ProjectCard';
import { staggerContainer, revealViewport } from '../../lib/motion';

export function Projects() {
  return (
    <section id="projects" className="section">
      <div className="container">
        <h2 className="section__title"><span>02.</span> Projects</h2>
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
