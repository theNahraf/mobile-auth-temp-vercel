'use client';

/**
 * LoadingSpinner – A premium loading spinner with pulsing animation.
 *
 * Features:
 *  • Three nested circles with staggered animation delays
 *  • Configurable size: 'sm' | 'md' | 'lg'
 *  • Optional loading text below the spinner
 *
 * CSS class: .loading-spinner-container (defined in globals.css)
 *
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.size='md'] – Size variant
 * @param {string} [props.text] – Optional loading text
 */

export default function LoadingSpinner({ size = 'md', text }) {
  return (
    <div className={`loading-spinner-container loading-spinner-${size}`}>
      {/* Three concentric circles with staggered pulse animations */}
      <div className="loading-spinner">
        <div className="spinner-ring spinner-ring-1" />
        <div className="spinner-ring spinner-ring-2" />
        <div className="spinner-ring spinner-ring-3" />
      </div>

      {/* Optional descriptive text beneath the spinner */}
      {text && <p className="loading-spinner-text">{text}</p>}
    </div>
  );
}
