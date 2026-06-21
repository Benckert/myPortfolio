import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { fadeUp, revealViewport } from '../../lib/motion';

export function Contact() {
  const { email, github, linkedin } = content.socials;
  return (
    <section id="contact" className="section section--contact">
      <div className="container">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
          <p className="contact__eyebrow">05. What&apos;s next?</p>
          <h2 className="contact__title">Get in touch</h2>
          <p className="contact__lead">
            I&apos;m open to junior front-end roles and interesting projects. The fastest way to
            reach me is email — I&apos;ll get back to you.
          </p>
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
