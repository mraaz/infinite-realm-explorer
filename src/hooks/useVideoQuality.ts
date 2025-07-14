
import { useState, useCallback } from "react";
import { DeviceDetection } from "./useDeviceDetection";

export type VideoQuality = 'HD' | 'SD' | 'Mobile';

export const useVideoQuality = (device: DeviceDetection) => {
  const [currentVideoQuality, setCurrentVideoQuality] = useState<VideoQuality>('Mobile');
  
  // Smart video quality selection with desktop priority
  const getOptimalVideoUrl = useCallback(() => {
    const baseUrl = "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/";
    
    console.log('Quality Selection Logic:', { 
      isDesktop: device.isDesktop, 
      isMobile: device.isMobile, 
      isIOS: device.isIOS, 
      connectionSpeed: device.connectionSpeed, 
      screenWidth: window.innerWidth 
    });
    
    // iOS devices always get mobile quality
    if (device.isIOS) {
      setCurrentVideoQuality('Mobile');
      return `${baseUrl}HomePageVideoMobile.mp4`;
    }
    
    // Desktop gets HD by default, SD for slow connections
    if (device.isDesktop) {
      if (device.connectionSpeed === 'slow') {
        setCurrentVideoQuality('SD');
        return `${baseUrl}HomePageVideoSD.mp4`;
      } else {
        setCurrentVideoQuality('HD');
        return `${baseUrl}HomePageVideoHD.mp4`;
      }
    }
    
    // Mobile phones get mobile quality
    if (device.isMobile) {
      setCurrentVideoQuality('Mobile');
      return `${baseUrl}HomePageVideoMobile.mp4`;
    }
    
    // Tablets and other devices
    const screenWidth = window.innerWidth;
    if (screenWidth >= 768 && screenWidth <= 1024) {
      setCurrentVideoQuality('SD');
      return `${baseUrl}HomePageVideoSD.mp4`;
    }
    
    // Default fallback
    setCurrentVideoQuality('SD');
    return `${baseUrl}HomePageVideoSD.mp4`;
  }, [device]);

  // Handle video load failure with quality downgrade
  const handleVideoLoadFailure = useCallback(async (videoRef: React.RefObject<HTMLVideoElement>) => {
    const baseUrl = "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/";
    const video = videoRef.current;
    if (!video) return false;

    try {
      let fallbackUrl = '';
      
      if (currentVideoQuality === 'HD') {
        setCurrentVideoQuality('SD');
        fallbackUrl = `${baseUrl}HomePageVideoSD.mp4`;
        console.log('HD failed, falling back to SD quality');
      } else if (currentVideoQuality === 'SD') {
        setCurrentVideoQuality('Mobile');
        fallbackUrl = `${baseUrl}HomePageVideoMobile.mp4`;
        console.log('SD failed, falling back to Mobile quality');
      } else {
        // Mobile quality failed - return false to indicate complete failure
        console.log('Mobile quality failed - no more fallbacks');
        return false;
      }

      const source = video.querySelector('source[type="video/mp4"]') as HTMLSourceElement;
      if (source) {
        source.src = fallbackUrl;
        video.load();
        return true;
      }
    } catch (error) {
      console.error('Fallback video load failed:', error);
      return false;
    }
    
    return false;
  }, [currentVideoQuality]);

  return {
    currentVideoQuality,
    getOptimalVideoUrl,
    handleVideoLoadFailure
  };
};
