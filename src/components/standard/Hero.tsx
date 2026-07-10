import { motion } from 'framer-motion';
import { contents, ui } from '../../data/content';
import { useLang } from '../../lib/useLang';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cssVar } from '../../lib/cssVar';
import { Portrait } from './Portrait';
import { Typewriter } from './Typewriter';
import { Spotlight } from './Spotlight';
import { techLogos } from './techLogos';
import StarBorder from '../reactbits/StarBorder';
import LogoLoop from '../reactbits/LogoLoop';

const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

export function Hero({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const reduced = usePrefersReducedMotion();
  const lang = useLang();
  const u = ui[lang];
  const { name, tagline, portraitUrl } = contents[lang].profile;

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
            {u.hero.eyebrow}
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
              <a className="btn btn--primary" href="#projects">{u.hero.viewWork}</a>
            </Spotlight>
            <StarBorder as="a" href="#contact" color={cssVar('--accent', '#5eead4')} speed="5s" className="hero__starcta">
              {u.hero.getInTouch}
            </StarBorder>
          </div>
          <button type="button" className="hero__hint" onClick={onOpenTerminal}>
            {u.hero.hintPre} <kbd className="hero__hint-key">{IS_MAC ? '⌘' : 'Ctrl'}</kbd>{' '}
            <kbd className="hero__hint-key">K</kbd> {u.hero.hintPost}
          </button>
        </div>
        {portraitUrl && (
          <motion.div
            className="hero__portrait-wrap"
            initial={reduced ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            <Portrait src={portraitUrl} name={name} size={320} />
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
          fadeOutColor={cssVar('--bg', '#0b0f17')}
          ariaLabel={u.hero.logosLabel}
        />
      </div>
    </section>
  );
}
