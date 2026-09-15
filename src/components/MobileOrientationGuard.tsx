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
  // Initialize Telegram WebApp features
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
      } catch (e) {
        console.warn('Telegram WebApp setup error:', e);
      }
    }
  }, []);

  // When mobile is held vertically: rotate content into landscape immediately,
  // with safe area padding on the left to clear Telegram's top close/navigation bar!
  if (isMobile && isPortrait) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-[#07090e] select-none w-screen h-screen">
        <div
          className="overflow-hidden bg-[#07090e] flex flex-col"
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
          {/* pl-14 (56px) provides dedicated safe clearance so Telegram's X Close button NEVER covers game UI */}
          <div className="w-full h-full pl-14 pr-5 pt-1.5 pb-1.5 flex flex-col relative overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Already horizontal / desktop: render directly
  return <>{children}</>;
};
