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
  const rootRef = useRef<HTMLDivElement>(null);
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

  // The dialog is aria-modal, so keep Tab cycling inside it — the site behind
  // the full-screen overlay must not receive focus. The prompt input is exempt:
  // its own handler owns Tab for completion.
  function trapFocus(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab' || e.target === inputRef.current) return;
    const root = rootRef.current;
    if (!root) return;
    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>('button, a[href], input'),
    ).filter((el) => el.offsetParent !== null); // skip hidden (e.g. chips on desktop)
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function pickChip(cmd: string) {
    term.run(cmd);
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
      ref={rootRef}
      className={`term-root${windowed ? ' term-root--windowed' : ''}`}
      role="dialog"
      aria-label="Interactive terminal"
      aria-modal="true"
      onKeyDown={trapFocus}
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
