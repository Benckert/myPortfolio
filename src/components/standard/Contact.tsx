import { motion } from 'framer-motion';
import { contents, ui } from '../../data/content';
import { useLang } from '../../lib/useLang';
import { fadeUp, revealViewport } from '../../lib/motion';

export function Contact() {
  const lang = useLang();
  const u = ui[lang];
  const { email, github, linkedin } = contents[lang].socials;
  return (
    <section id="contact" className="section section--contact">
      <div className="container">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
          <p className="contact__eyebrow">{u.contact.eyebrow}</p>
          <h2 className="contact__title">{u.contact.title}</h2>
          <p className="contact__lead">{u.contact.lead}</p>
          <a className="btn btn--primary" href={`mailto:${email}`}>{email}</a>
          <div className="contact__socials">
            {github && <a href={github} target="_blank" rel="noopener noreferrer">GitHub</a>}
            {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
