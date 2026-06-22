import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface LightboxProps {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
  /** Shared id matching the in-page portrait, enabling the expand/return
   *  layout transition. Omit (or under reduced-motion) for a plain fade. */
  layoutId?: string;
}

/** A minimal accessible image viewer: click a portrait to expand it. Closes on
 *  the ✕ button, a backdrop click, or Escape. The image stops click propagation
 *  so clicking it doesn't dismiss the dialog. */
export function Lightbox({ src, alt, open, onClose, layoutId }: LightboxProps) {
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

  return (
    <AnimatePresence>
      {open && (
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
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* The shared layoutId makes the image grow + travel from its in-page
              portrait to this centered position, then reverse on close. */}
          <motion.img
            className="lightbox__img"
            src={src}
            alt={alt}
            layoutId={reduced ? undefined : layoutId}
            onClick={(e) => e.stopPropagation()}
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
      )}
    </AnimatePresence>
  );
}
