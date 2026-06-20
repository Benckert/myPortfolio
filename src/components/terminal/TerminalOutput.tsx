import type { OutputLine } from '../../lib/types';

export function TerminalOutput({ line }: { line: OutputLine }) {
  if (line.type === 'link') {
    return (
      <div className="term-line">
        <a href={line.href} target="_blank" rel="noopener noreferrer">
          {line.label}
        </a>
      </div>
    );
  }
  return <div className={`term-line term-${line.type}`}>{line.text || ' '}</div>;
}
