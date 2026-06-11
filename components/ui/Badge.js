'use client';

/**
 * Badge – A pill-shaped status badge component.
 *
 * Features:
 *  • Five variants: 'success', 'warning', 'danger', 'info', 'default'
 *  • Two sizes: 'sm', 'md'
 *  • Semantic lead-status mapping helper
 *
 * Lead status mapping:
 *  • 'new'         → danger
 *  • 'in_progress' → warning
 *  • 'resolved'    → success
 *
 * CSS classes: .badge, .badge-{variant}, .badge-{size} (defined in globals.css)
 *
 * @param {Object} props
 * @param {string} props.text – Badge label
 * @param {'success'|'warning'|'danger'|'info'|'default'} [props.variant='default']
 * @param {'sm'|'md'} [props.size='md']
 */

// ── Lead status → badge variant mapping ──────────────────────────
const STATUS_VARIANT_MAP = {
  new: 'danger',
  in_progress: 'warning',
  resolved: 'success',
};

/**
 * Helper: Resolves a lead status string to the appropriate badge variant.
 * Falls back to the given variant or 'default'.
 */
export function getVariantForStatus(status) {
  return STATUS_VARIANT_MAP[status] || 'default';
}

export default function Badge({ text, variant = 'default', size = 'md' }) {
  return (
    <span className={`badge badge-${variant} badge-${size}`}>
      {text}
    </span>
  );
}
