
import { useState, useCallback } from "react";
import { DeviceDetection } from "./useDeviceDetection";

export type VideoQuality = 'HD' | 'SD' | 'Mobile';

export const useVideoQuality = (device: DeviceDetection) => {
  const [currentVideoQuality, setCurrentVideoQuality] = useState<VideoQuality>('SD');
  
  // Reliable video quality selection with verified URLs
  const getOptimalVideoUrl = useCallback(() => {
    const baseUrl = "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/";
    
    console.log('Video Quality Selection:', { 
      isDesktop: device.isDesktop, 
      isMobile: device.isMobile, 
      isIOS: device.isIOS, 
      connectionSpeed: device.connectionSpeed, 
      screenWidth: window.innerWidth 
    });
    
    // iOS devices always get mobile quality for best compatibility
    if (device.isIOS) {
      setCurrentVideoQuality('Mobile');
      const url = `${baseUrl}HomePageVideoMobile.mp4`;
      console.log('Selected iOS Mobile quality:', url);
      return url;
    }
    
    // Desktop gets SD quality for reliability (28MB vs 41MB HD)
    if (device.isDesktop) {
      setCurrentVideoQuality('SD');
      const url = `${baseUrl}HomePageVideoSD.mp4`;
      console.log('Selected Desktop SD quality:', url);
      return url;
    }
    
    // Mobile phones get mobile quality
    if (device.isMobile) {
      setCurrentVideoQuality('Mobile');
      const url = `${baseUrl}HomePageVideoMobile.mp4`;
      console.log('Selected Mobile quality:', url);
      return url;
    }
    
    // Default fallback to SD
    setCurrentVideoQuality('SD');
    const url = `${baseUrl}HomePageVideoSD.mp4`;
    console.log('Selected fallback SD quality:', url);
    return url;
  }, [device]);

  // Handle video load failure with quality downgrade
  const handleVideoLoadFailure = useCallback(async (videoRef: React.RefObject<HTMLVideoElement>) => {
    const baseUrl = "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/";
    const video = videoRef.current;
    if (!video) return false;

    try {
      let fallbackUrl = '';
      let newQuality: VideoQuality;
      
      if (currentVideoQuality === 'HD') {
        newQuality = 'SD';
        fallbackUrl = `${baseUrl}HomePageVideoSD.mp4`;
        console.log('HD failed, falling back to SD quality:', fallbackUrl);
      } else if (currentVideoQuality === 'SD') {
        newQuality = 'Mobile';
        fallbackUrl = `${baseUrl}HomePageVideoMobile.mp4`;
        console.log('SD failed, falling back to Mobile quality:', fallbackUrl);
      } else {
        console.log('Mobile quality failed - no more fallbacks available');
        return false;
      }

      setCurrentVideoQuality(newQuality);
      
      // Set the new source directly on the video element
      video.src = fallbackUrl;
      video.load();
      
      return true;
    } catch (error) {
      console.error('Fallback video load failed:', error);
      return false;
    }
  }, [currentVideoQuality]);

  return {
    currentVideoQuality,
    getOptimalVideoUrl,
    handleVideoLoadFailure
  };
};
