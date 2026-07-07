import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import TiltedCard from '../reactbits/TiltedCard';

interface PortraitProps {
  src: string;
  name: string;
  /** Square size of the tilt card in px. */
  size: number;
}

/** The hover-tilting portrait shared by Hero and About. Purely decorative —
 *  no click action, no lightbox, no tooltip. */
export function Portrait({ src, name, size }: PortraitProps) {
  const reduced = usePrefersReducedMotion();
  const px = `${size}px`;
  return (
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
    />
  );
}
