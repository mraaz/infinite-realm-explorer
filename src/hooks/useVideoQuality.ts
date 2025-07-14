
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export type VideoQuality = 'HD' | 'SD' | 'Mobile';
export type ConnectionSpeed = 'fast' | 'slow' | 'unknown';

export const useVideoQuality = () => {
  const isMobile = useIsMobile();
  const [connectionSpeed, setConnectionSpeed] = useState<ConnectionSpeed>('unknown');
  const [isIOS, setIsIOS] = useState(false);

  // Enhanced iOS detection
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const maxTouchPoints = navigator.maxTouchPoints;
    
    const isIOSDevice = 
      /iPad|iPhone|iPod/.test(userAgent) ||
      (platform === 'MacIntel' && maxTouchPoints > 1) ||
      (/Safari/.test(userAgent) && /Mobile/.test(userAgent)) ||
      /iPhone OS|iOS/.test(userAgent) ||
      (/Mac/.test(platform) && 'ontouchend' in document);
    
    setIsIOS(isIOSDevice);
  }, []);

  // Initialize connection speed immediately - DEFAULT DESKTOP TO FAST
  useEffect(() => {
    // Immediately set default based on device type
    const initialSpeed = (!isMobile && !isIOS) ? 'fast' : 'slow';
    setConnectionSpeed(initialSpeed);
    
    // Then try to detect actual connection speed
    const detectConnectionSpeed = () => {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn) {
          const effectiveType = conn.effectiveType;
          const downlink = conn.downlink;
          
          // Update based on actual connection info
          if (effectiveType === '4g' || downlink > 1) {
            setConnectionSpeed('fast');
          } else if (effectiveType === '3g' || effectiveType === '2g') {
            setConnectionSpeed('slow');
          }
        }
      }
    };

    // Small delay to allow the initial render with default speed
    setTimeout(detectConnectionSpeed, 100);
  }, [isMobile, isIOS]);

  // Smart video quality selection with desktop preference for SD
  const getOptimalVideoUrl = () => {
    const baseUrl = "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/";
    
    // iOS devices always get Mobile quality
    if (isIOS) {
      return {
        url: `${baseUrl}HomePageVideoMobile.mp4`,
        quality: 'Mobile' as VideoQuality,
        size: '7MB'
      };
    }
    
    // Mobile devices get Mobile quality
    if (isMobile) {
      return {
        url: `${baseUrl}HomePageVideoMobile.mp4`,
        quality: 'Mobile' as VideoQuality,
        size: '7MB'
      };
    }
    
    // Desktop quality selection
    const screenWidth = window.innerWidth;
    
    if (connectionSpeed === 'slow') {
      return {
        url: `${baseUrl}HomePageVideoMobile.mp4`,
        quality: 'Mobile' as VideoQuality,
        size: '7MB'
      };
    }
    
    // Handle unknown connection speed - default to SD for desktop
    if (connectionSpeed === 'unknown') {
      return {
        url: `${baseUrl}HomePageVideoSD.mp4`,
        quality: 'SD' as VideoQuality,
        size: '29MB'
      };
    }
    
    // Desktop with fast connection - prefer SD for reliability
    if (screenWidth >= 1920 && connectionSpeed === 'fast') {
      return {
        url: `${baseUrl}HomePageVideoHD.mp4`,
        quality: 'HD' as VideoQuality,
        size: '43MB'
      };
    }
    
    // Default desktop quality - SD
    return {
      url: `${baseUrl}HomePageVideoSD.mp4`,
      quality: 'SD' as VideoQuality,
      size: '29MB'
    };
  };

  return {
    getOptimalVideoUrl,
    connectionSpeed,
    isIOS,
    isMobile
  };
};
