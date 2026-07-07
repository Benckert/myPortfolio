import { useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Lightbox } from './Lightbox';
import TiltedCard from '../reactbits/TiltedCard';

interface PortraitProps {
  src: string;
  name: string;
  /** Square size of the tilt card in px. */
  size: number;
  /** Extra class(es) on the trigger button, e.g. 'portrait-btn--tilt'. */
  className?: string;
}

/** The clickable tilting portrait + lightbox pair shared by Hero and About. */
export function Portrait({ src, name, size, className }: PortraitProps) {
  const reduced = usePrefersReducedMotion();
  const [zoom, setZoom] = useState(false);
  const px = `${size}px`;
  return (
    <>
      <button
        type="button"
        className={`portrait-btn${className ? ` ${className}` : ''}`}
        onClick={() => setZoom(true)}
        aria-label={`Enlarge portrait of ${name}`}
      >
        <TiltedCard
          imageSrc={src}
          altText={`Portrait of ${name}`}
          captionText="Click to enlarge"
          containerHeight={px}
          containerWidth={px}
          imageHeight={px}
          imageWidth={px}
          rotateAmplitude={reduced ? 0 : 12}
          scaleOnHover={reduced ? 1 : 1.06}
          showMobileWarning={false}
        />
      </button>
      <Lightbox
        src={src}
        alt={`Portrait of ${name}`}
        open={zoom}
        onClose={() => setZoom(false)}
      />
    </>
  );
}
