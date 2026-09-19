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
      // In Fullsize / standard mode: Telegram's native title bar ("X Void Covenant ˅ :") is OUTSIDE the webview frame.
      // Therefore, the webview begins right below the bar and safeTop is 0 (or whatever small device inset applies).
      // In Fullscreen mode: Telegram's floating close pill [✕] overlays inside the webview, requiring ~50-54px clearance.
      let safeTop = 0;
      if (tg) {
        const isFullscreen = Boolean(tg?.isFullscreen);
        const inset = tg?.contentSafeAreaInset?.top ?? tg?.safeAreaInset?.top ?? 0;
        if (isFullscreen) {
          safeTop = inset > 0 ? Math.max(inset + 4, 52) : 52;
        } else {
          // Standard fullsize sheet: native bar is outside webview frame
          safeTop = inset > 0 ? inset : 0;
        }
      }
      document.documentElement.style.setProperty('--safe-top', `${safeTop}px`);

      // Safe bottom clearance for Android 3-button navigation / iOS home bar
      let safeBottom = 6;
      if (tg) {
        const bInset = tg?.safeAreaInset?.bottom ?? tg?.contentSafeAreaInset?.bottom;
        if (typeof bInset === 'number' && bInset > 0) {
          safeBottom = Math.max(6, bInset);
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
