import { useSyncExternalStore } from 'react';
import { cssVar } from './cssVar';

const DEFAULT_ACCENT = '#5eead4';
const listeners = new Set<() => void>();

/** Null means "no override" — the token from globals.css is in effect. */
let override: string | null = null;

export function getAccent(): string {
  if (override) return override;
  return cssVar('--accent', DEFAULT_ACCENT) || DEFAULT_ACCENT;
}

/**
 * Set (or clear, with null) the site accent. Writes the CSS custom property so
 * all token-driven styling follows, and notifies subscribers so JS-driven
 * colour consumers — the WebGL fluid palette — can rebuild too.
 */
export function setAccent(hex: string | null) {
  override = hex;
  const root = document.documentElement;
  if (hex) root.style.setProperty('--accent', hex);
  else root.style.removeProperty('--accent');
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Current accent colour; re-renders subscribers when `theme` changes it. */
export function useAccent(): string {
  return useSyncExternalStore(subscribe, getAccent, () => DEFAULT_ACCENT);
}
