import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface LightboxProps {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
}

/** A minimal accessible image viewer: click a portrait to expand it. Closes on
 *  the ✕ button, a backdrop click, or Escape. The image stops click propagation
 *  so clicking it doesn't dismiss the dialog. */
export function Lightbox({ src, alt, open, onClose }: LightboxProps) {
  const reduced = usePrefersReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={(e) => {
        // Only a click on the backdrop itself dismisses; clicks on children
        // (close button, image) bubble up here but must not double-fire.
        if (e.target === e.currentTarget) onClose();
      }}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.img
        className="lightbox__img"
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        initial={reduced ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
      <button
        ref={closeRef}
        type="button"
        className="lightbox__close"
        aria-label="Close image"
        onClick={onClose}
      >
        ✕
      </button>
    </motion.div>
  );
}
