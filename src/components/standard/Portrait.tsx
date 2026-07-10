import { useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import TiltedCard from '../reactbits/TiltedCard';
import { Skeleton } from '../ui/skeleton';

interface PortraitProps {
  src: string;
  name: string;
  /** Square size of the tilt card in px. */
  size: number;
}

/** The hover-tilting portrait shared by Hero and About. Purely decorative —
 *  no click action, no lightbox, no tooltip. Four states: a skeleton shimmers
 *  while the image loads, the card is the default/success state, and on a
 *  failed load the whole block hides (an empty frame is worse than nothing). */
export function Portrait({ src, name, size }: PortraitProps) {
  const reduced = usePrefersReducedMotion();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const px = `${size}px`;
  if (status === 'error') return null;
  return (
    <div className="relative" style={{ width: px, height: px }}>
      <TiltedCard
        imageSrc={src}
        altText={`Portrait of ${name}`}
        containerHeight={px}
        containerWidth={px}
        imageHeight={px}
        imageWidth={px}
        rotateAmplitude={reduced ? 0 : 12}
        scaleOnHover={reduced ? 1 : 1.06}
        showMobileWarning={false}
        showTooltip={false}
        onImageLoad={() => setStatus('ready')}
        onImageError={() => setStatus('error')}
      />
      {status === 'loading' && (
        <Skeleton className="pointer-events-none absolute inset-0 rounded-[15px] bg-[var(--bg-elev)]" />
      )}
    </div>
  );
}
