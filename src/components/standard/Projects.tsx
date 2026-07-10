import { motion } from 'framer-motion';
import { contents, ui } from '../../data/content';
import { useLang } from '../../lib/useLang';
import { ProjectCard } from './ProjectCard';
import { staggerContainer, revealViewport } from '../../lib/motion';

export function Projects() {
  const lang = useLang();
  return (
    <section id="projects" className="section">
      <div className="container">
        <h2 className="section__title"><span>02.</span> {ui[lang].nav.projects}</h2>
        <p className="section__lead">{ui[lang].sections.projectsLead}</p>
        <motion.div
          className="cards"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={revealViewport}
        >
          {contents[lang].projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
