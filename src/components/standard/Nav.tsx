import { useEffect, useState } from 'react';
import { content } from '../../data/content';

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
];

export function Nav({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const [active, setActive] = useState('');

  // Highlight the link of the section currently in view (same half-visible
  // heuristic as SlidePager). Hero has no link, so nothing lights up at the top.
  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.href.slice(1))).filter(
      (el): el is HTMLElement => el !== null,
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { threshold: 0.5 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header className="nav">
      <div className="container nav__inner">
        <a href="#home" className="nav__brand">{content.profile.name.split(' ')[0]}<span>.</span></a>
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={active === l.href ? 'nav__active' : undefined}
              aria-current={active === l.href ? 'true' : undefined}
            >
              {l.label}
            </a>
          ))}
          <button type="button" className="nav__term" onClick={onOpenTerminal} aria-label="Open terminal mode">{'>_'}</button>
        </nav>
      </div>
    </header>
  );
}
