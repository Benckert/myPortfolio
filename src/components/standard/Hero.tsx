import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export function Hero({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const reduced = usePrefersReducedMotion();
  const { name, tagline, portraitUrl } = content.profile;

  return (
    <section id="home" className="hero">
      <div className="hero__aurora" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__text">
          <motion.p
            className="hero__eyebrow"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Hi, my name is
          </motion.p>
          <motion.h1
            className="hero__name"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            {name}
          </motion.h1>
          <motion.p
            className="hero__tagline"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            {tagline}
          </motion.p>
          <div className="hero__cta">
            <a className="btn btn--primary" href="#projects">View my work</a>
            <a className="btn btn--ghost" href="#contact">Get in touch</a>
          </div>
          <button type="button" className="hero__hint" onClick={onOpenTerminal}>
            <span className="hero__hint-key">`</span> psst — press backtick for terminal mode
          </button>
        </div>
        {portraitUrl && (
          <motion.div
            className="hero__portrait-wrap"
            initial={reduced ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            <img
              className="hero__portrait"
              src={portraitUrl}
              alt={`Portrait of ${name}`}
              width={320}
              height={320}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
