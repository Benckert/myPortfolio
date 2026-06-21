import { content } from '../../data/content';

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
];

export function Nav({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  return (
    <header className="nav">
      <div className="container nav__inner">
        <a href="#home" className="nav__brand">{content.profile.name.split(' ')[0]}<span>.</span></a>
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
          <button type="button" className="nav__term" onClick={onOpenTerminal} aria-label="Open terminal mode">{'>_'}</button>
        </nav>
      </div>
    </header>
  );
}
