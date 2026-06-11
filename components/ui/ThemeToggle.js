'use client';

/**
 * ThemeToggle – A beautiful circular toggle button for switching
 * between dark and light themes.
 *
 * Features:
 *  • Smooth rotation animation on toggle
 *  • Sun (☀️) icon for light mode, Moon (🌙) icon for dark mode
 *  • Accessible with aria-label
 *
 * CSS class: .theme-toggle (defined in globals.css)
 */

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className={`theme-toggle-icon ${theme === 'dark' ? 'rotate' : ''}`}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
