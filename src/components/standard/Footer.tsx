import { content } from '../../data/content';

export function Footer({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>© {new Date().getFullYear()} {content.profile.name}</span>
        <span className="footer__built">
          Built with React &amp; TypeScript ·{' '}
          <button type="button" className="footer__term" onClick={onOpenTerminal}>try the terminal</button>
        </span>
      </div>
    </footer>
  );
}
