
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export type VideoQuality = 'HD' | 'SD' | 'Mobile';
export type ConnectionSpeed = 'fast' | 'slow' | 'unknown';

export const useVideoQuality = () => {
  const isMobile = useIsMobile();
  const [connectionSpeed, setConnectionSpeed] = useState<ConnectionSpeed>('unknown');
  const [isIOS, setIsIOS] = useState(false);

  // Enhanced iOS detection with debugging
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const maxTouchPoints = navigator.maxTouchPoints;
    
    console.log('🔍 [VideoQuality] Device Detection:', {
      userAgent,
      platform,
      maxTouchPoints,
      isMobile,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      timestamp: new Date().toISOString()
    });
    
    const isIOSDevice = 
      /iPad|iPhone|iPod/.test(userAgent) ||
      (platform === 'MacIntel' && maxTouchPoints > 1) ||
      (/Safari/.test(userAgent) && /Mobile/.test(userAgent)) ||
      /iPhone OS|iOS/.test(userAgent) ||
      (/Mac/.test(platform) && 'ontouchend' in document);
    
    console.log('📱 [VideoQuality] iOS Detection Result:', {
      isIOSDevice,
      checks: {
        iPadIPhonePod: /iPad|iPhone|iPod/.test(userAgent),
        macWithTouch: platform === 'MacIntel' && maxTouchPoints > 1,
        safariMobile: /Safari/.test(userAgent) && /Mobile/.test(userAgent),
        iOSUserAgent: /iPhone OS|iOS/.test(userAgent),
        macWithTouchEnd: /Mac/.test(platform) && 'ontouchend' in document
      }
    });
    
    setIsIOS(isIOSDevice);
  }, [isMobile]);

  // Connection speed detection with debugging
  useEffect(() => {
    console.log('🌐 [VideoQuality] Connection Speed Detection Started:', {
      isMobile,
      isIOS,
      timestamp: new Date().toISOString()
    });

    // Desktop gets fast connection immediately
    if (!isMobile && !isIOS) {
      console.log('💻 [VideoQuality] Desktop detected - setting fast connection');
      setConnectionSpeed('fast');
    } else {
      console.log('📱 [VideoQuality] Mobile/iOS detected - setting slow connection initially');
      setConnectionSpeed('slow');
    }
    
    // Optional: Try to detect actual connection speed for mobile
    if (isMobile || isIOS) {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn) {
          const effectiveType = conn.effectiveType;
          const downlink = conn.downlink;
          
          console.log('📡 [VideoQuality] Network Connection Details:', {
            effectiveType,
            downlink,
            rtt: conn.rtt,
            saveData: conn.saveData
          });
          
          if (effectiveType === '4g' || downlink > 1) {
            console.log('🚀 [VideoQuality] Good mobile connection - upgrading to fast');
            setConnectionSpeed('fast');
          } else if (effectiveType === '3g' || effectiveType === '2g') {
            console.log('🐌 [VideoQuality] Slow mobile connection - keeping slow');
            setConnectionSpeed('slow');
          }
        } else {
          console.log('❌ [VideoQuality] No connection object available');
        }
      } else {
        console.log('❌ [VideoQuality] Navigator.connection not supported');
      }
    }
  }, [isMobile, isIOS]);

  // Smart video quality selection with debugging
  const getOptimalVideoUrl = () => {
    const baseUrl = "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/";
    const screenWidth = window.innerWidth;
    
    console.log('🎯 [VideoQuality] Quality Selection Process:', {
      isIOS,
      isMobile,
      connectionSpeed,
      screenWidth,
      timestamp: new Date().toISOString()
    });
    
    // iOS devices always get Mobile quality
    if (isIOS) {
      const result = {
        url: `${baseUrl}HomePageVideoMobile.mp4`,
        quality: 'Mobile' as VideoQuality,
        size: '7MB'
      };
      console.log('📱 [VideoQuality] iOS -> Mobile quality selected:', result);
      return result;
    }
    
    // Mobile devices get Mobile quality
    if (isMobile) {
      const result = {
        url: `${baseUrl}HomePageVideoMobile.mp4`,
        quality: 'Mobile' as VideoQuality,
        size: '7MB'
      };
      console.log('📱 [VideoQuality] Mobile -> Mobile quality selected:', result);
      return result;
    }
    
    // Desktop quality selection
    if (connectionSpeed === 'slow') {
      const result = {
        url: `${baseUrl}HomePageVideoMobile.mp4`,
        quality: 'Mobile' as VideoQuality,
        size: '7MB'
      };
      console.log('🐌 [VideoQuality] Desktop slow connection -> Mobile quality selected:', result);
      return result;
    }
    
    // Desktop with fast connection - prefer SD for reliability
    if (screenWidth >= 1920 && connectionSpeed === 'fast') {
      const result = {
        url: `${baseUrl}HomePageVideoHD.mp4`,
        quality: 'HD' as VideoQuality,
        size: '43MB'
      };
      console.log('🖥️ [VideoQuality] Desktop large screen + fast -> HD quality selected:', result);
      return result;
    }
    
    // Default desktop quality - SD
    const result = {
      url: `${baseUrl}HomePageVideoSD.mp4`,
      quality: 'SD' as VideoQuality,
      size: '29MB'
    };
    console.log('🖥️ [VideoQuality] Desktop default -> SD quality selected:', result);
    return result;
  };

  return {
    getOptimalVideoUrl,
    connectionSpeed,
    isIOS,
    isMobile
  };
};
