import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
}

export function useDeviceDetect(): DeviceInfo {
  const checkDevice = (): DeviceInfo => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        isPortrait: false,
        isLandscape: true,
      };
    }

    const ua = navigator.userAgent || '';
    const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTabletUA = /iPad|Tablet/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;

    // A device is considered mobile if it has mobile UA or small touch screen
    const isMobileDevice = isMobileUA || (hasTouch && width <= 850 && isPortrait) || (hasTouch && height <= 520 && !isPortrait);
    const isTabletDevice = !isMobileDevice && (isTabletUA || (hasTouch && width <= 1180));
    const isDesktopDevice = !isMobileDevice && !isTabletDevice;

    return {
      isMobile: isMobileDevice,
      isTablet: isTabletDevice,
      isDesktop: isDesktopDevice,
      isTouch: hasTouch,
      isPortrait,
      isLandscape: !isPortrait,
    };
  };

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(checkDevice);

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(checkDevice());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
}
