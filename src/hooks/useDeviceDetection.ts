
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface DeviceDetection {
  isMobile: boolean;
  isIOS: boolean;
  isDesktop: boolean;
  connectionSpeed: 'fast' | 'slow' | 'unknown';
}

export const useDeviceDetection = (): DeviceDetection => {
  const isMobile = useIsMobile();
  const [isIOS, setIsIOS] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow' | 'unknown'>('unknown');

  // Enhanced device detection with better desktop/iOS distinction
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // More precise iOS detection - exclude Mac Desktop
    const isIOSDevice = 
      /iPad|iPhone|iPod/.test(userAgent) ||
      (/Safari/.test(userAgent) && /Mobile/.test(userAgent) && !/Mac/.test(platform)) ||
      /iPhone OS|iOS/.test(userAgent);
    
    // Desktop detection - includes Mac Desktop with Chrome
    const isDesktopDevice = 
      !isMobile && 
      !isIOSDevice &&
      (window.innerWidth >= 1024) &&
      (
        /Mac/.test(platform) ||
        /Win/.test(platform) ||
        /Linux/.test(platform) ||
        /Chrome/.test(userAgent) ||
        /Firefox/.test(userAgent) ||
        /Safari/.test(userAgent) && /Mac/.test(platform)
      );
    
    setIsIOS(isIOSDevice);
    setIsDesktop(isDesktopDevice);
    
    console.log('Device Detection:', { 
      isIOSDevice, 
      isDesktopDevice, 
      isMobile, 
      userAgent: userAgent.substring(0, 50) + '...', 
      platform,
      screenWidth: window.innerWidth
    });
  }, [isMobile]);

  // Enhanced connection speed detection with desktop priority
  useEffect(() => {
    const detectConnectionSpeed = () => {
      // Use Navigator connection API if available
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn) {
          const effectiveType = conn.effectiveType;
          const downlink = conn.downlink;
          
          console.log('Connection Info:', { effectiveType, downlink });
          
          if (effectiveType === '4g' && downlink > 10) {
            setConnectionSpeed('fast');
          } else if (effectiveType === '4g' && downlink > 2) {
            setConnectionSpeed('fast');
          } else if (effectiveType === '3g' || effectiveType === 'slow-2g' || effectiveType === '2g') {
            setConnectionSpeed('slow');
          } else {
            setConnectionSpeed('unknown');
          }
          return;
        }
      }
      
      // Enhanced fallback logic - prioritize desktop as fast
      if (isDesktop) {
        setConnectionSpeed('fast');
      } else if (isMobile || isIOS) {
        setConnectionSpeed('slow');
      } else {
        setConnectionSpeed('unknown');
      }
    };

    detectConnectionSpeed();
  }, [isMobile, isIOS, isDesktop]);

  return {
    isMobile,
    isIOS,
    isDesktop,
    connectionSpeed
  };
};
