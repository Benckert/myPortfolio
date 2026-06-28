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
import ClickSpark from '../reactbits/ClickSpark';
import './standard.css';

export function StandardSite({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const reduced = usePrefersReducedMotion();
  const site = (
    <>
      <a className="skip-link" href="#home">Skip to content</a>
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
      <LiquidBackground />
      {reduced ? (
        site
      ) : (
        <ClickSpark sparkColor="#5eead4" sparkRadius={18} sparkCount={10} duration={500}>
          {site}
        </ClickSpark>
      )}
    </>
  );
}
