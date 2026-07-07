import { useCallback, useEffect, useState } from 'react';

export type Mode = 'standard' | 'terminal';
const KEY = 'portfolio-mode';

function initialMode(): Mode {
  if (typeof window === 'undefined') return 'standard';
  if (window.location.hash === '#terminal') return 'terminal';
  return localStorage.getItem(KEY) === 'terminal' ? 'terminal' : 'standard';
}

export function useMode() {
  const [mode, setMode] = useState<Mode>(initialMode);

  const open = useCallback(() => {
    setMode('terminal');
    window.location.hash = 'terminal';
    localStorage.setItem(KEY, 'terminal');
  }, []);

  const close = useCallback(() => {
    setMode('standard');
    if (window.location.hash === '#terminal') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    localStorage.setItem(KEY, 'standard');
  }, []);

  // global keyboard: Ctrl/Cmd+K opens (only from the standard site, so we don't
  // swallow the browser's Ctrl/Cmd+K once the terminal is already open), Escape closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (mode === 'standard' && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        open();
      } else if (mode === 'terminal' && e.key === 'Escape') {
        close();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close, mode]);

  // react to hash changes (back/forward, shared links); persist so a mode
  // change via the back button survives a reload like open()/close() do
  useEffect(() => {
    function onHash() {
      const next: Mode = window.location.hash === '#terminal' ? 'terminal' : 'standard';
      setMode(next);
      localStorage.setItem(KEY, next);
    }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return { mode, open, close };
}
