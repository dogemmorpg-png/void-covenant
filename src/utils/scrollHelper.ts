import { useEffect } from 'react';

/**
 * Instantly resets window and document scroll position to top (0, 0).
 * Clears scroll on window, documentElement, and body.
 */
export const scrollToTopInstant = () => {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  if (document.documentElement) {
    document.documentElement.scrollTop = 0;
  }
  if (document.body) {
    document.body.scrollTop = 0;
  }
};

/**
 * React hook that triggers an instant scroll reset to top whenever any of the
 * given dependencies change. Uses requestAnimationFrame to ensure the scroll
 * position stays pinned at (0, 0) even after new DOM layout is calculated.
 */
export const useScrollToTopOnChange = (...dependencies: any[]) => {
  useEffect(() => {
    scrollToTopInstant();
    const rafId = requestAnimationFrame(scrollToTopInstant);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};
