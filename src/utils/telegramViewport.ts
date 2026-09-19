/**
 * Utilities for initializing and maintaining precise viewport height and safe-area insets
 * across Telegram Mini Apps (both fullscreen and bottom-sheet modes) as well as mobile browsers.
 */

export function initTelegramViewport() {
  if (typeof window === 'undefined') return;

  const updateAppHeight = () => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      let height = window.innerHeight;

      // In Telegram Mini App, tg.viewportHeight provides the exact visible height inside the sheet
      if (tg?.viewportHeight && typeof tg.viewportHeight === 'number') {
        height = tg.viewportHeight;
      } else if (window.visualViewport?.height) {
        height = window.visualViewport.height;
      }

      document.documentElement.style.setProperty('--app-height', `${height}px`);

      if (tg?.viewportHeight) {
        document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
      }
      if (tg?.viewportStableHeight) {
        document.documentElement.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`);
      }

      // Safe area clearance:
      // When Telegram is in true fullscreen (no native top header), floating close buttons require top inset.
      // In standard/sheet mode, Telegram native header sits ABOVE the webview, so safe top inset is 0px.
      const isFullscreen = Boolean(tg?.isFullscreen);
      let safeTop = 0;
      if (isFullscreen) {
        const inset = tg?.contentSafeAreaInset?.top ?? tg?.safeAreaInset?.top;
        safeTop = typeof inset === 'number' && inset > 0 ? Math.max(inset, 48) : 48;
      }
      document.documentElement.style.setProperty('--safe-top', `${safeTop}px`);

      // Safe bottom clearance for Android 3-button navigation / iOS home bar
      let safeBottom = 16;
      if (tg) {
        const bInset = tg?.safeAreaInset?.bottom ?? tg?.contentSafeAreaInset?.bottom;
        if (typeof bInset === 'number' && bInset > 0) {
          safeBottom = Math.max(16, bInset + 4);
        }
      }
      document.documentElement.style.setProperty('--safe-bottom', `${safeBottom}px`);
    } catch (e) {
      console.warn('Error updating Telegram viewport height:', e);
    }
  };

  // Immediate initial calculation
  updateAppHeight();

  // Telegram SDK early initialization
  const tg = (window as any).Telegram?.WebApp;
  if (tg) {
    try {
      tg.ready?.();
      tg.expand?.();
      if (typeof tg.disableVerticalSwipes === 'function') {
        tg.disableVerticalSwipes();
      }
      if (typeof tg.requestFullscreen === 'function') {
        tg.requestFullscreen();
      }
    } catch (e) {
      console.warn('Telegram early expand failed:', e);
    }

    try {
      tg.onEvent?.('viewportChanged', ({ isStateStable }: { isStateStable?: boolean } = {}) => {
        if (!tg.isExpanded) {
          tg.expand?.();
        }
        updateAppHeight();
      });
      tg.onEvent?.('fullscreenChanged', () => {
        updateAppHeight();
      });
      tg.onEvent?.('safeAreaChanged', () => {
        updateAppHeight();
      });
      tg.onEvent?.('contentSafeAreaChanged', () => {
        updateAppHeight();
      });
    } catch (e) {}
  }

  // Window resize & orientation change listeners
  window.addEventListener('resize', updateAppHeight);
  window.addEventListener('orientationchange', updateAppHeight);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateAppHeight);
  }

  // Attempt requestFullscreen on first user touch gesture if supported by Telegram client
  const handleFirstUserGesture = () => {
    if (tg && typeof tg.requestFullscreen === 'function' && !tg.isFullscreen) {
      try {
        tg.requestFullscreen();
      } catch (e) {}
    }
  };
  window.addEventListener('click', handleFirstUserGesture, { once: true, passive: true });
  window.addEventListener('touchend', handleFirstUserGesture, { once: true, passive: true });
}
