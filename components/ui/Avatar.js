'use client';

/**
 * Avatar – A user avatar component with image or initials fallback.
 *
 * Features:
 *  • Displays photoURL in a circle when available
 *  • Falls back to initials on a gradient background
 *  • Gradient color is deterministic – derived from the first letter
 *  • Three sizes: 'sm' (32px), 'md' (40px), 'lg' (56px)
 *
 * CSS classes: .avatar, .avatar-sm, .avatar-md, .avatar-lg,
 *              .avatar-image, .avatar-initials (defined in globals.css)
 *
 * @param {Object} props
 * @param {string} props.name – Full name (used for initials & gradient seed)
 * @param {string} [props.photoURL] – Image URL
 * @param {'sm'|'md'|'lg'} [props.size='md'] – Size variant
 */

// ── Gradient palette mapped to first letter (A-Z) ──────────────
const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // A
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // B
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // C
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // D
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // E
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // F
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', // G
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', // H
  'linear-gradient(135deg, #f5576c 0%, #ff9a9e 100%)', // I
  'linear-gradient(135deg, #667eea 0%, #00f2fe 100%)', // J
  'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)', // K
  'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)', // L
  'linear-gradient(135deg, #feada6 0%, #f5efef 100%)', // M
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', // N
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', // O
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', // P
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', // Q
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // R
  'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', // S
  'linear-gradient(135deg, #a6c0fe 0%, #f68084 100%)', // T
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', // U
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', // V
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // W
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // X
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Y
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Z
];

/**
 * Extracts up to two initials from a full name.
 * e.g. "John Doe" → "JD", "Alice" → "A"
 */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

/**
 * Picks a gradient based on the first character of the name.
 */
function getGradient(name) {
  if (!name) return GRADIENTS[0];
  const index = name.trim().toUpperCase().charCodeAt(0) - 65; // A = 0
  return GRADIENTS[Math.abs(index) % GRADIENTS.length];
}

export default function Avatar({ name, photoURL, size = 'md' }) {
  const initials = getInitials(name);

  return (
    <div className={`avatar avatar-${size}`} title={name}>
      {photoURL ? (
        /* ── Photo avatar ──────────────────────────────────── */
        <img
          className="avatar-image"
          src={photoURL}
          alt={name}
          loading="lazy"
        />
      ) : (
        /* ── Initials fallback with gradient ───────────────── */
        <div
          className="avatar-initials"
          style={{ background: getGradient(name) }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
