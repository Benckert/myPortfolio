import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface TypewriterProps {
  text: string;
  speed?: number; // ms per character
  startDelay?: number; // ms before typing starts
  className?: string;
}

/** Types `text` once, then rests with a blinking caret. The typed span is
 *  aria-hidden — wrap it in an element that carries the real accessible name. */
export function Typewriter({ text, speed = 70, startDelay = 300, className }: TypewriterProps) {
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(reduced ? text.length : 0);

  useEffect(() => {
    if (reduced) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let i = 0;
    let stepTimer: ReturnType<typeof setTimeout>;
    const startTimer = setTimeout(function tick() {
      i += 1;
      setCount(i);
      if (i < text.length) stepTimer = setTimeout(tick, speed);
    }, startDelay);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(stepTimer);
    };
  }, [text, speed, startDelay, reduced]);

  const done = count >= text.length;
  return (
    <span className={className} aria-hidden="true">
      {text.slice(0, count)}
      <span className={`typewriter__caret${done ? ' typewriter__caret--rest' : ''}`} />
    </span>
  );
}
