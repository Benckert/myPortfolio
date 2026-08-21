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
  // Every character is always in the DOM — untyped ones are just transparent.
  // The line layout is therefore final from the first frame, so a name that
  // wraps starts its second line in place instead of jumping down mid-type.
  const chars = Array.from(text);
  const caretAt = Math.max(0, count - 1);
  return (
    <span
      className={`typewriter${done ? ' typewriter--done' : ''}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      {chars.map((ch, i) => (
        <span
          key={i}
          className={
            'typewriter__char' +
            (i < count ? ' typewriter__char--in' : '') +
            (i === caretAt ? ' typewriter__char--caret' : '') +
            (count === 0 && i === 0 ? ' typewriter__char--caret-start' : '')
          }
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
