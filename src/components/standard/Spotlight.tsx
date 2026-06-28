import { useRef } from 'react';

interface SpotlightProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

/** Wraps a control and paints a cursor-following radial highlight on hover via
 *  --mx/--my CSS vars. Disabled under reduced motion (see standard.css). */
export function Spotlight({ children, className = '', ...rest }: SpotlightProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const onMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <span ref={ref} className={`spotlight ${className}`.trim()} onMouseMove={onMove} {...rest}>
      {children}
    </span>
  );
}
