'use client';

/**
 * ShimmerLoader – Shimmer / skeleton loading placeholders.
 *
 * Components:
 *  • ShimmerLine  – Single animated line (configurable width & height)
 *  • ShimmerCard  – Card-shaped placeholder with header + body lines
 *  • ShimmerList  – Multiple ShimmerLine elements stacked vertically
 *
 * All animations rely on the CSS @keyframes shimmer rule in globals.css.
 *
 * CSS classes: .shimmer-line, .shimmer-card, .shimmer-list
 *              (defined in globals.css)
 */

/**
 * ShimmerLine – A single animated placeholder line.
 *
 * @param {Object} props
 * @param {string} [props.width='100%'] – CSS width value
 * @param {string} [props.height='16px'] – CSS height value
 * @param {string} [props.borderRadius='8px'] – Border radius
 */
export function ShimmerLine({ width = '100%', height = '16px', borderRadius = '8px' }) {
  return (
    <div
      className="shimmer-line"
      style={{ width, height, borderRadius }}
    />
  );
}

/**
 * ShimmerCard – A card-shaped skeleton placeholder.
 * Mimics a typical content card with a header area and body lines.
 */
export function ShimmerCard() {
  return (
    <div className="shimmer-card">
      {/* Simulated card header / image area */}
      <ShimmerLine width="40%" height="20px" />

      {/* Simulated body text lines */}
      <ShimmerLine width="100%" height="14px" />
      <ShimmerLine width="90%" height="14px" />
      <ShimmerLine width="75%" height="14px" />
    </div>
  );
}

/**
 * ShimmerList – Multiple shimmer lines stacked vertically.
 *
 * @param {Object} props
 * @param {number} [props.lines=5] – Number of lines to render
 * @param {string} [props.lineHeight='14px'] – Height of each line
 * @param {string} [props.gap='12px'] – Gap between lines
 */
export function ShimmerList({ lines = 5, lineHeight = '14px', gap = '12px' }) {
  return (
    <div className="shimmer-list" style={{ gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerLine
          key={i}
          /* Vary widths for a natural look */
          width={`${100 - i * 5}%`}
          height={lineHeight}
        />
      ))}
    </div>
  );
}
