import { useState } from 'react';
import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Lightbox } from './Lightbox';
import { Typewriter } from './Typewriter';
import { Spotlight } from './Spotlight';
import { techLogos } from './techLogos';
import StarBorder from '../reactbits/StarBorder';
import TiltedCard from '../reactbits/TiltedCard';
import LogoLoop from '../reactbits/LogoLoop';

export function Hero({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [zoom, setZoom] = useState(false);
  const { name, tagline, portraitUrl } = content.profile;

  return (
    <section id="home" className="hero">
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
          <h1 className="hero__name" aria-label={name}>
            <Typewriter text={name} />
          </h1>
          <motion.p
            className="hero__tagline"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            {tagline}
          </motion.p>
          <div className="hero__cta">
            <Spotlight>
              <a className="btn btn--primary" href="#projects">View my work</a>
            </Spotlight>
            <StarBorder as="a" href="#contact" color="#5eead4" speed="5s" className="hero__starcta">
              Get in touch
            </StarBorder>
          </div>
          <button type="button" className="hero__hint" onClick={onOpenTerminal}>
            {(() => {
              const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
              const mod = isMac ? '⌘' : 'Ctrl';
              return <>psst — press <kbd className="hero__hint-key">{mod}</kbd> <kbd className="hero__hint-key">K</kbd> for terminal mode</>;
            })()}
          </button>
        </div>
        {portraitUrl && (
          <motion.div
            className="hero__portrait-wrap"
            initial={reduced ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            <button
              type="button"
              className="portrait-btn portrait-btn--tilt"
              onClick={() => setZoom(true)}
              aria-label={`Enlarge portrait of ${name}`}
            >
              <TiltedCard
                imageSrc={portraitUrl}
                altText={`Portrait of ${name}`}
                captionText="Click to enlarge"
                containerHeight="320px"
                containerWidth="320px"
                imageHeight="320px"
                imageWidth="320px"
                rotateAmplitude={reduced ? 0 : 12}
                scaleOnHover={reduced ? 1 : 1.06}
                showMobileWarning={false}
              />
            </button>
            <Lightbox
              src={portraitUrl}
              alt={`Portrait of ${name}`}
              open={zoom}
              onClose={() => setZoom(false)}
            />
          </motion.div>
        )}
      </div>
      <div className="container hero__logos">
        <LogoLoop
          logos={techLogos}
          speed={40}
          gap={48}
          logoHeight={28}
          fadeOut
          fadeOutColor="#0b0f17"
          ariaLabel="Technologies I work with"
        />
      </div>
    </section>
  );
}
