import React, { useEffect } from 'react';

interface MobileOrientationGuardProps {
  isMobile: boolean;
  isPortrait: boolean;
  children: React.ReactNode;
}

export const MobileOrientationGuard: React.FC<MobileOrientationGuardProps> = ({
  isMobile,
  isPortrait,
  children,
}) => {
  // Telegram Mini App Fullscreen and Orientation setup
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      try {
        tg.ready();
        tg.expand();
        if (typeof tg.requestFullscreen === 'function') {
          tg.requestFullscreen();
        }
        if (typeof tg.disableVerticalSwipes === 'function') {
          tg.disableVerticalSwipes();
        }
        if (typeof tg.lockOrientation === 'function') {
          tg.lockOrientation();
        }
      } catch (e) {
        console.warn('Telegram WebApp setup error:', e);
      }
    }
  }, []);

  // When mobile and in portrait mode: automatically rotate into landscape directly
  // No "rotate device" blockers — the game opens horizontally with zero user action needed!
  if (isMobile && isPortrait) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-[#050505] select-none w-screen h-screen">
        <div
          className="overflow-hidden bg-[#050505]"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100dvh',
            height: '100dvw',
            transformOrigin: '0 0',
            transform: 'translate(100dvw, 0) rotate(90deg)',
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  // Already landscape or on desktop: render directly
  return <>{children}</>;
};
