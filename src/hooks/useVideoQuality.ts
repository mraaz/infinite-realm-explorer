
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

  // Initialize connection speed immediately - NO DELAYS
  useEffect(() => {
    // Desktop gets fast connection immediately
    if (!isMobile && !isIOS) {
      setConnectionSpeed('fast');
    } else {
      setConnectionSpeed('slow');
    }
    
    // Optional: Try to detect actual connection speed for mobile
    if (isMobile || isIOS) {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn) {
          const effectiveType = conn.effectiveType;
          const downlink = conn.downlink;
          
          if (effectiveType === '4g' || downlink > 1) {
            setConnectionSpeed('fast');
          } else if (effectiveType === '3g' || effectiveType === '2g') {
            setConnectionSpeed('slow');
          }
        }
      }
    }
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
    
    // Desktop defaults to SD - no more unknown states
    // connectionSpeed should always be set for desktop
    
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
