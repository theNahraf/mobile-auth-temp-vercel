'use client';

import { useEffect } from 'react';

export default function MobileWrapper({ children }) {
  useEffect(() => {
    // Add global click listener for haptics
    const handleGlobalClick = async (e) => {
      const target = e.target.closest('button, a, .clickable');
      if (target) {
        try {
          const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch (err) {
          // Ignore if not in capacitor environment
        }
      }
    };

    // Prevent default browser behavior for links that should open in native browser
    const handleLinkClick = async (e) => {
      const link = e.target.closest('a');
      if (link && link.href && (link.href.startsWith('http') || link.href.startsWith('https')) && !link.href.includes(window.location.host)) {
        e.preventDefault();
        try {
          const { Browser } = await import('@capacitor/browser');
          await Browser.open({ url: link.href });
        } catch (err) {
          window.open(link.href, '_blank');
        }
      }
    };

    // Handle Android Back Button
    const handleBackButton = async () => {
      try {
        const { App } = await import('@capacitor/app');
        App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            // If we can't go back, minimize the app instead of closing
            App.minimizeApp();
          }
        });
      } catch (err) {
        console.error('Back button listener error:', err);
      }
    };

    // Handle Deep Links (App state restoration)
    const handleDeepLinks = async () => {
      try {
        const { App } = await import('@capacitor/app');
        App.addListener('appUrlOpen', (data) => {
          // data.url will be something like com.aakash.aggregators://...
          console.log('App opened with URL:', data.url);
        });
      } catch (err) {
        console.error('Deep link listener error:', err);
      }
    };

    // Set status bar style for Android
    const setupStatusBar = async () => {
      try {
        // The Capacitor status bar plugin would be configured here
        // For now, the Android theme handles status bar styling
      } catch (err) {
        // Status bar plugin not available
      }
    };

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('click', handleLinkClick);
    handleBackButton();
    handleDeepLinks();
    setupStatusBar();

    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  return children;
}
