import { useEffect, useRef } from 'react';
import { useTerminal } from '../../lib/useTerminal';
import { TerminalOutput } from './TerminalOutput';
import { CommandChips } from './CommandChips';
import './terminal.css';

const PROMPT = 'visitor@portfolio:~$';

const INTRO = [
  "Welcome to the terminal. Type 'help' to get started, or 'exit' to leave.",
];

export function Terminal({ onExit }: { onExit: () => void }) {
  const term = useTerminal({ onExit });
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && typeof el.scrollTo === 'function') {
      el.scrollTo({ top: el.scrollHeight });
    }
  }, [term.entries]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      term.submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      term.historyUp();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      term.historyDown();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      term.complete();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onExit();
    }
  }

  function pickChip(cmd: string) {
    term.setInput(cmd);
    // submit on next tick after state set
    requestAnimationFrame(() => term.submit());
    inputRef.current?.focus();
  }

  return (
    <div className="term-root" role="dialog" aria-label="Interactive terminal" aria-modal="true">
      <div className="term-bar">
        <span className="term-dot term-dot--red" />
        <span className="term-dot term-dot--amber" />
        <span className="term-dot term-dot--green" />
        <span className="term-title">{PROMPT.replace(':~$', '')}</span>
        <button type="button" className="term-close" onClick={onExit} aria-label="Close terminal">
          ✕
        </button>
      </div>

      <div className="term-screen" ref={scrollRef} onClick={() => inputRef.current?.focus()}>
        {INTRO.map((l, i) => (
          <div key={`intro-${i}`} className="term-line term-intro">
            {l}
          </div>
        ))}

        {term.entries.map((entry) => (
          <div key={entry.id} className="term-entry">
            {entry.input !== null && (
              <div className="term-line term-echo">
                <span className="term-prompt">{PROMPT}</span> {entry.input}
              </div>
            )}
            {entry.output.map((line, i) => (
              <TerminalOutput key={i} line={line} />
            ))}
          </div>
        ))}

        <div className="term-inputline">
          <span className="term-prompt">{PROMPT}</span>
          <input
            ref={inputRef}
            className="term-input"
            aria-label="terminal input"
            value={term.input}
            onChange={(e) => term.setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      </div>

      <CommandChips onPick={pickChip} />
    </div>
  );
}
