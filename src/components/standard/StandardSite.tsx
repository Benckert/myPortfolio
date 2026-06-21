import { Nav } from './Nav';
import { Hero } from './Hero';
import './standard.css';

export function StandardSite({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  return (
    <>
      <Nav onOpenTerminal={onOpenTerminal} />
      <main>
        <Hero onOpenTerminal={onOpenTerminal} />
        {/* About, Projects, Skills, Experience, Contact, Footer added in Tasks 11–12 */}
      </main>
    </>
  );
}
