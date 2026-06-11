'use client';

/**
 * Toast Notification System
 *
 * Provides a context-based toast notification system for the entire app.
 *
 * Features:
 *  • Four variants: 'success', 'error', 'info', 'warning'
 *  • Auto-dismiss after 4 seconds
 *  • Slide-in from top-right animation
 *  • Stackable – multiple toasts displayed simultaneously
 *  • Dismiss on click
 *
 * Usage:
 *   1. Wrap your app with <ToastProvider>
 *   2. const { showToast } = useToast();
 *   3. showToast('Operation successful!', 'success');
 *
 * CSS classes: .toast-container, .toast, .toast-success, .toast-error,
 *              .toast-info, .toast-warning (defined in globals.css)
 *
 * Exports: { ToastProvider, useToast }
 */

import { createContext, useContext, useState, useCallback, useRef } from 'react';

// ── Context ──────────────────────────────────────────────────────
const ToastContext = createContext(null);

/**
 * Hook to access the toast system.
 * @returns {{ showToast: (message: string, type?: string) => void }}
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return context;
}

// ── Icons for each toast variant ─────────────────────────────────
const TOAST_ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

// ── Auto-dismiss duration (ms) ──────────────────────────────────
const DISMISS_DELAY = 4000;

/**
 * ToastProvider – Wrap your app with this to enable toasts.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idCounter = useRef(0);

  // ── Show a new toast ────────────────────────────────────────
  const showToast = useCallback((message, type = 'info') => {
    const id = ++idCounter.current;

    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    // Auto-dismiss after DISMISS_DELAY
    setTimeout(() => {
      dismissToast(id);
    }, DISMISS_DELAY);
  }, []);

  // ── Dismiss a toast with exit animation ─────────────────────
  const dismissToast = useCallback((id) => {
    // Mark as exiting so CSS can animate out
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );

    // Remove from DOM after animation completes (300ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* ── Toast Container (top-right) ──────────────────────── */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : ''}`}
            onClick={() => dismissToast(toast.id)}
            role="alert"
          >
            <span className="toast-icon">{TOAST_ICONS[toast.type]}</span>
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
