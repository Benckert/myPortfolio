import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { revealViewport } from '../lib/motion';

// Returns a ref + a boolean for whether the element has entered the viewport.
export function useScrollReveal() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, revealViewport);
  return { ref, inView };
}
