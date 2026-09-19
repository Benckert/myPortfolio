import { Nav } from './Nav';
import { Hero } from './Hero';
import { About } from './About';
import { Projects } from './Projects';
import { Skills } from './Skills';
import { Experience } from './Experience';
import { Contact } from './Contact';
import { Footer } from './Footer';
import { BackToTop } from './BackToTop';
import { SlidePager } from './SlidePager';
import { LiquidBackground } from './LiquidBackground';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { ui } from '../../data/content';
import { useLang } from '../../lib/useLang';
import ClickSpark from '../reactbits/ClickSpark';
import { useAccent } from '../../lib/useAccent';
import { buildSparkColor } from '../../lib/palette';
import { clickSpark } from '../../config/site';
import './standard.css';

export function StandardSite({
  onOpenTerminal,
  terminalOpen = false,
}: {
  onOpenTerminal: () => void;
  /** True while the terminal overlay covers the site — pauses the WebGL background. */
  terminalOpen?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const lang = useLang();
  const accent = useAccent();
  // Complement of the accent, so the burst contrasts with whatever theme is
  // active instead of disappearing into it.
  const sparkColor = buildSparkColor(accent);
  const site = (
    <>
      <a className="skip-link" href="#home">{ui[lang].skipLink}</a>
      <Nav onOpenTerminal={onOpenTerminal} />
      <main>
        <Hero onOpenTerminal={onOpenTerminal} />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer onOpenTerminal={onOpenTerminal} />
      <BackToTop />
      <SlidePager />
    </>
  );

  return (
    <>
      <LiquidBackground paused={terminalOpen} />
      {reduced ? (
        site
      ) : (
        <ClickSpark
          sparkColor={sparkColor}
          sparkSize={clickSpark.size}
          sparkRadius={clickSpark.radius}
          sparkCount={clickSpark.count}
          duration={clickSpark.duration}
        >
          {site}
        </ClickSpark>
      )}
    </>
  );
}
