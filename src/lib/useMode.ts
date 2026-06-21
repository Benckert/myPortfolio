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

  // global keyboard: backtick opens, Escape closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (e.key === '`' && !typing) {
        e.preventDefault();
        open();
      } else if (e.key === 'Escape') {
        close();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  // react to hash changes (back/forward, shared links)
  useEffect(() => {
    function onHash() {
      setMode(window.location.hash === '#terminal' ? 'terminal' : 'standard');
    }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return { mode, open, close };
}
