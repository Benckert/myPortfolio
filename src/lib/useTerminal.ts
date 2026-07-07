import { useCallback, useRef, useState } from 'react';
import { content } from '../data/content';
import type { OutputLine } from './types';
import { runCommand, commandNames, argCandidates } from './commands';

export interface ScrollbackEntry {
  id: number;
  input: string | null;
  output: OutputLine[];
}

export interface UseTerminal {
  entries: ScrollbackEntry[];
  input: string;
  setInput: (s: string) => void;
  /** Run a specific line directly (e.g. a command chip), bypassing the input state. */
  run: (line: string) => void;
  submit: () => void;
  historyUp: () => void;
  historyDown: () => void;
  complete: () => void;
}

function longestCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return '';
  let prefix = strings[0];
  for (const s of strings) {
    while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

export function useTerminal(opts: { onExit: () => void }): UseTerminal {
  const [entries, setEntries] = useState<ScrollbackEntry[]>([]);
  const [input, setInput] = useState('');
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1); // -1 = editing fresh input
  const idRef = useRef(0);

  const append = useCallback((entryInput: string | null, output: OutputLine[]) => {
    setEntries((prev) => [...prev, { id: idRef.current++, input: entryInput, output }]);
  }, []);

  const run = useCallback(
    (line: string) => {
      const trimmed = line.trim();
      if (trimmed) historyRef.current.push(trimmed);
      historyIndexRef.current = -1;

      const output = runCommand(line, {
        content,
        history: [...historyRef.current],
        actions: {
          clear: () => setEntries([]),
          exit: opts.onExit,
          openUrl: (url) => window.open(url, '_blank', 'noopener,noreferrer'),
        },
      });

      // `clear` empties entries via its action; don't also append the echo.
      if (trimmed.split(/\s+/)[0]?.toLowerCase() === 'clear') {
        setInput('');
        return;
      }
      append(line, output);
      setInput('');
    },
    [append, opts.onExit],
  );

  const submit = useCallback(() => run(input), [run, input]);

  const historyUp = useCallback(() => {
    const h = historyRef.current;
    if (h.length === 0) return;
    if (historyIndexRef.current === -1) historyIndexRef.current = h.length - 1;
    else historyIndexRef.current = Math.max(0, historyIndexRef.current - 1);
    setInput(h[historyIndexRef.current]);
  }, []);

  const historyDown = useCallback(() => {
    const h = historyRef.current;
    if (historyIndexRef.current === -1) return;
    if (historyIndexRef.current >= h.length - 1) {
      historyIndexRef.current = -1;
      setInput('');
    } else {
      historyIndexRef.current += 1;
      setInput(h[historyIndexRef.current]);
    }
  }, []);

  const complete = useCallback(() => {
    const parts = input.split(/\s+/);
    if (parts.length <= 1) {
      // completing a command name
      const prefix = parts[0] ?? '';
      const matches = commandNames.filter((c) => c.startsWith(prefix));
      if (matches.length === 1) setInput(matches[0] + ' ');
      else if (matches.length > 1) {
        const lcp = longestCommonPrefix(matches);
        if (lcp.length > prefix.length) setInput(lcp);
        else append(input, [{ type: 'text', text: matches.join('   ') }]);
      }
      return;
    }
    // completing an argument
    const cmd = parts[0].toLowerCase();
    const argPrefix = parts[parts.length - 1];
    const candidates = argCandidates(cmd, content).filter((c) => c.startsWith(argPrefix));
    if (candidates.length === 1) {
      parts[parts.length - 1] = candidates[0];
      setInput(parts.join(' '));
    } else if (candidates.length > 1) {
      const lcp = longestCommonPrefix(candidates);
      if (lcp.length > argPrefix.length) {
        parts[parts.length - 1] = lcp;
        setInput(parts.join(' '));
      } else {
        append(input, [{ type: 'text', text: candidates.join('   ') }]);
      }
    }
  }, [input, append]);

  return { entries, input, setInput, run, submit, historyUp, historyDown, complete };
}
