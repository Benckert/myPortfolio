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
 *  the ✕ button, a backdrop click, or Escape. The dimming layer is a separate
 *  element so its fade never bleeds opacity onto the image. */
export function Lightbox({ src, alt, open, onClose, layoutId }: LightboxProps) {
  const reduced = usePrefersReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock page scroll + focus the close button while open. Locking also keeps
  // the in-page portrait stationary, so the return animation lands correctly.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const { documentElement: html, body } = document;
    const prev = { html: html.style.overflow, body: body.style.overflow };
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev.html;
      body.style.overflow = prev.body;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={(e) => {
            // Only a click on the backdrop area dismisses; the image and close
            // button stop/own their clicks. The dimming layer is click-through.
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Separate dimming layer: fading this keeps the image fully opaque.
              pointer-events:none so clicks fall through to the dialog above. */}
          <motion.div
            className="lightbox__backdrop"
            aria-hidden="true"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          {/* The shared layoutId makes the image grow + travel from its in-page
              portrait to this centered position, then reverse on close. */}
          <motion.img
            className="lightbox__img"
            src={src}
            alt={alt}
            layoutId={reduced ? undefined : layoutId}
            initial={reduced || layoutId ? false : { opacity: 0, scale: 0.92 }}
            animate={reduced || layoutId ? undefined : { opacity: 1, scale: 1 }}
            exit={reduced || layoutId ? undefined : { opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
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
        </div>
      )}
    </AnimatePresence>
  );
}
