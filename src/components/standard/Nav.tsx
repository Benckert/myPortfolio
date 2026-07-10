import { useEffect, useState } from 'react';
import { contents, ui } from '../../data/content';
import { useLang, setLang } from '../../lib/useLang';

const LINKS = ['about', 'projects', 'experience', 'skills', 'contact'] as const;

export function Nav({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const lang = useLang();
  const [active, setActive] = useState('');

  // Highlight the link of the section currently in view (same half-visible
  // heuristic as SlidePager). Hero has no link, so nothing lights up at the top.
  useEffect(() => {
    const els = LINKS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
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
        <a href="#home" className="nav__brand">{contents[lang].profile.name.split(' ')[0]}<span>.</span></a>
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? 'nav__active' : undefined}
              aria-current={active === id ? 'true' : undefined}
            >
              {ui[lang].nav[id]}
            </a>
          ))}
          <button
            type="button"
            className="nav__term"
            onClick={() => setLang(lang === 'en' ? 'sv' : 'en')}
            aria-label={lang === 'en' ? 'Byt språk till svenska' : 'Switch language to English'}
          >
            {lang === 'en' ? 'SV' : 'EN'}
          </button>
          <button type="button" className="nav__term" onClick={onOpenTerminal} aria-label="Open terminal mode">{'>_'}</button>
        </nav>
      </div>
    </header>
  );
}
