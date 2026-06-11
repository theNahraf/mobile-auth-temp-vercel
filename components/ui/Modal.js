'use client';

/**
 * Modal – A reusable, accessible modal dialog component.
 *
 * Features:
 *  • Animated entrance (fadeIn + scaleIn)
 *  • Overlay with backdrop click to close
 *  • Close button (✕) in header
 *  • Escape key dismissal
 *  • Body scroll lock while open
 *  • Configurable size: 'sm' | 'md' | 'lg'
 *
 * CSS classes: .modal-overlay, .modal-content, .modal-header,
 *              .modal-body, .modal-close (defined in globals.css)
 *
 * @param {Object} props
 * @param {boolean} props.isOpen – Whether the modal is visible
 * @param {Function} props.onClose – Callback to close the modal
 * @param {string} [props.title] – Optional header title
 * @param {React.ReactNode} props.children – Modal body content
 * @param {'sm'|'md'|'lg'} [props.size='md'] – Width variant
 */

import { useEffect, useCallback } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // ── Escape key handler ──────────────────────────────────────
  const handleEscape = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    // Listen for Escape key
    document.addEventListener('keydown', handleEscape);

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleEscape]);

  // Don't render anything when closed
  if (!isOpen) return null;

  // ── Backdrop click handler ──────────────────────────────────
  const handleOverlayClick = (e) => {
    // Only close when clicking the overlay itself, not its children
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content modal-${size}`} role="dialog" aria-modal="true">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
