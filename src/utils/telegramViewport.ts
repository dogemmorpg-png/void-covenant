/**
 * Utilities for initializing and maintaining precise viewport height and safe-area insets
 * across Telegram Mini Apps (both fullscreen and standard modes) as well as mobile browsers.
 */

export function initTelegramViewport() {
  if (typeof window === 'undefined') return;

  const updateAppHeight = () => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      const isTg = Boolean(tg?.initData || /Telegram/i.test(navigator.userAgent || ''));
      let height = window.innerHeight;

      // In Telegram Mini App, tg.viewportHeight provides the exact visible height inside the sheet
      if (isTg && tg?.viewportHeight && typeof tg.viewportHeight === 'number') {
        height = tg.viewportHeight;
      } else if (window.visualViewport?.height) {
        height = window.visualViewport.height;
      }

      document.documentElement.style.setProperty('--app-height', `${height}px`);

      if (isTg && tg?.viewportHeight) {
        document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
      }
      if (isTg && tg?.viewportStableHeight) {
        document.documentElement.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`);
      }

      // Safe area clearance:
      // Mobile browsers (Chrome, Safari, OKX wallet, etc.): safeTop and safeBottom are 0px!
      // In Telegram Fullsize / standard mode: native bar is outside webview frame, safeTop is 0px!
      // In Telegram Fullscreen mode: floating close pill [✕] overlays inside webview, requiring clearance.
      let safeTop = 0;
      let safeBottom = 0;

      if (isTg && tg) {
        const isFullscreen = Boolean(tg?.isFullscreen);
        const inset = tg?.contentSafeAreaInset?.top ?? tg?.safeAreaInset?.top ?? 0;
        if (isFullscreen) {
          safeTop = inset > 0 ? Math.max(inset + 4, 52) : 52;
        } else {
          safeTop = inset > 0 ? inset : 0;
        }

        const bInset = tg?.safeAreaInset?.bottom ?? tg?.contentSafeAreaInset?.bottom;
        if (typeof bInset === 'number' && bInset > 0) {
          safeBottom = Math.max(0, bInset);
        }
      }

      document.documentElement.style.setProperty('--safe-top', `${safeTop}px`);
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
