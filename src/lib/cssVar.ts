/** Read a CSS custom property from :root at call time, so JS-prop colours
 *  (WebGL palettes, component colour props) track the design tokens in
 *  globals.css instead of hardcoding hex literals that silently drift when the
 *  palette changes. Returns `fallback` when the value is unavailable — e.g.
 *  jsdom in tests, which doesn't resolve stylesheet custom properties. */
export function cssVar(name: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
