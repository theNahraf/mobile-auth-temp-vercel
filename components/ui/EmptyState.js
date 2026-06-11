'use client';

/**
 * EmptyState – A centered placeholder for empty / zero-data screens.
 *
 * Features:
 *  • Large emoji icon
 *  • Heading + description text
 *  • Optional call-to-action button
 *
 * CSS classes: .empty-state, .empty-state-icon, .empty-state-title,
 *              .empty-state-description, .empty-state-action
 *              (defined in globals.css)
 *
 * @param {Object} props
 * @param {string} [props.icon='📭'] – Emoji displayed as the main icon
 * @param {string} props.title – Heading text
 * @param {string} [props.description] – Explanatory subtext
 * @param {string} [props.actionLabel] – CTA button label
 * @param {Function} [props.onAction] – CTA button click handler
 */

export default function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state">
      {/* Large decorative icon */}
      <div className="empty-state-icon">{icon}</div>

      {/* Heading */}
      <h3 className="empty-state-title">{title}</h3>

      {/* Supporting description */}
      {description && (
        <p className="empty-state-description">{description}</p>
      )}

      {/* Optional call-to-action */}
      {actionLabel && onAction && (
        <button className="empty-state-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
