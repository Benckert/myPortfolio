import { Nav } from './Nav';
import { Hero } from './Hero';
import { About } from './About';
import { Skills } from './Skills';
import { Experience } from './Experience';
import './standard.css';

export function StandardSite({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  return (
    <>
      <Nav onOpenTerminal={onOpenTerminal} />
      <main>
        <Hero onOpenTerminal={onOpenTerminal} />
        <About />
        {/* Projects added in Task 12 */}
        <Skills />
        <Experience />
        {/* Contact + Footer added in Task 12 */}
      </main>
    </>
  );
}
