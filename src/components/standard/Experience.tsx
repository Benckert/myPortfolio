import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { fadeUp, revealViewport } from '../../lib/motion';

interface TimelineItem {
  title: string;
  org: string;
  period: string;
  points: string[];
}

function Timeline({
  label,
  items,
  edu = false,
}: {
  label: string;
  items: TimelineItem[];
  edu?: boolean;
}) {
  return (
    <div className={`exp-col${edu ? ' exp-col--edu' : ''}`}>
      <h3 className="exp-col__label">{label}</h3>
      <div className="timeline">
        {items.map((item, i) => (
          <motion.div
            key={`${item.org}-${i}`}
            className="timeline__item"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={revealViewport}
          >
            <div className="timeline__dot" aria-hidden="true" />
            <div className="timeline__body">
              <h4 className="timeline__role">{item.title} <span>· {item.org}</span></h4>
              <p className="timeline__period">{item.period}</p>
              <ul className="timeline__points">
                {item.points.map((p, j) => <li key={j}>{p}</li>)}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function Experience() {
  const work: TimelineItem[] = content.experience.map((e) => ({
    title: e.role,
    org: e.org,
    period: e.period,
    points: e.points,
  }));
  const education: TimelineItem[] = content.education.map((e) => ({
    title: e.credential,
    org: e.org,
    period: e.period,
    points: e.points ?? [],
  }));

  return (
    <section id="experience" className="section">
      <div className="container">
        <h2 className="section__title"><span>03.</span> Experience</h2>
        <div className="exp-grid">
          <Timeline label="Work" items={work} />
          <Timeline label="Education" items={education} edu />
        </div>
      </div>
    </section>
  );
}
