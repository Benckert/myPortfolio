import { useEffect, useState } from 'react';

/**
 * True only while the page is both visible *and* focused.
 *
 * Two separate signals, because they fire in different situations:
 *   - `visibilitychange` covers switching browser tabs or minimising, but a
 *     backgrounded tab does not always fire it, and it never fires when another
 *     application takes focus while the page stays on screen.
 *   - `blur`/`focus` on the window cover exactly that case — clicking into
 *     another app, or hovering one that takes focus.
 *
 * Used to unmount expensive animation while nobody is looking at it.
 */
export function usePageActive(): boolean {
  const [active, setActive] = useState(() => {
    if (typeof document === 'undefined') return true;
    return !document.hidden && document.hasFocus();
  });

  useEffect(() => {
    const sync = () => setActive(!document.hidden && document.hasFocus());
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('blur', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('blur', sync);
    };
  }, []);

  return active;
}
