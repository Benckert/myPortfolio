import { useEffect, useRef, useState } from 'react';
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
  const [windowed, setWindowed] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    return () => previouslyFocused?.focus?.();
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

  function handleRestore() {
    setMinimized(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  if (minimized) {
    return (
      <button
        type="button"
        className="term-restore"
        aria-label="Restore terminal"
        onClick={handleRestore}
      >
        <span className="term-restore-icon" aria-hidden="true">{'>_'}</span>
        {PROMPT.replace(':~$', '')}
      </button>
    );
  }

  return (
    <div
      className={`term-root${windowed ? ' term-root--windowed' : ''}`}
      role="dialog"
      aria-label="Interactive terminal"
      aria-modal="true"
    >
      <div className="term-bar">
        <button
          type="button"
          className="term-dot term-dot--red"
          aria-label="Close terminal"
          onClick={onExit}
        />
        <button
          type="button"
          className="term-dot term-dot--amber"
          aria-label="Minimize terminal"
          onClick={() => setMinimized(true)}
        />
        <button
          type="button"
          className="term-dot term-dot--green"
          aria-label="Zoom terminal"
          aria-pressed={windowed}
          onClick={() => setWindowed((w) => !w)}
        />
        <span className="term-title">{PROMPT.replace(':~$', '')}</span>
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
