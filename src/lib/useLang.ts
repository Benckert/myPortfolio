import { useSyncExternalStore } from 'react';
import type { Lang } from '../data/content';

const KEY = 'portfolio-lang';
const listeners = new Set<() => void>();

function detect(): Lang {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === 'en' || stored === 'sv') return stored;
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.toLowerCase().startsWith('sv') ? 'sv' : 'en';
}

let current: Lang = detect();
if (typeof document !== 'undefined') document.documentElement.lang = current;

export function getLang(): Lang {
  return current;
}

export function setLang(next: Lang) {
  if (next === current) return;
  current = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* best-effort */
  }
  document.documentElement.lang = next;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Current site language; re-renders subscribers when it changes. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, () => 'en' as Lang);
}
