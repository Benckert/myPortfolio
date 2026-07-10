import { contents, ui } from '../../data/content';
import { useLang } from '../../lib/useLang';

export function Footer({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const lang = useLang();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>© {new Date().getFullYear()} {contents[lang].profile.name}</span>
        <span className="footer__built">
          {ui[lang].footer.built}{' '}
          <button type="button" className="footer__term" onClick={onOpenTerminal}>{ui[lang].footer.tryTerminal}</button>
        </span>
      </div>
    </footer>
  );
}
