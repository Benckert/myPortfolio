import { Nav } from './Nav';
import { Hero } from './Hero';
import { About } from './About';
import { Projects } from './Projects';
import { Skills } from './Skills';
import { Experience } from './Experience';
import { Contact } from './Contact';
import { Footer } from './Footer';
import './standard.css';

export function StandardSite({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  return (
    <>
      <a className="skip-link" href="#home">Skip to content</a>
      <Nav onOpenTerminal={onOpenTerminal} />
      <main>
        <Hero onOpenTerminal={onOpenTerminal} />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <Footer onOpenTerminal={onOpenTerminal} />
    </>
  );
}
