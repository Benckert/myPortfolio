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
