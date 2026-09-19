/**
 * Utilities for initializing and maintaining precise viewport height and safe-area insets
 * across Telegram Mini Apps (both fullscreen and standard modes) as well as mobile browsers.
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
      // Telegram native controls (title bar / close button / icons) occupy the top ~50-56px.
      // We set a minimum clearance of 62px so game headers never collide with Telegram controls.
      let safeTop = 0;
      if (tg) {
        const inset = tg?.contentSafeAreaInset?.top ?? tg?.safeAreaInset?.top;
        safeTop = typeof inset === 'number' && inset > 0 ? Math.max(inset + 4, 62) : 62;
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
}
