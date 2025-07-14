
import { useState, useCallback } from "react";
import { DeviceDetection } from "./useDeviceDetection";

export type VideoQuality = 'HD' | 'SD' | 'Mobile';

export const useVideoQuality = (device: DeviceDetection) => {
  const [currentVideoQuality, setCurrentVideoQuality] = useState<VideoQuality>('SD');
  
  // Get optimal video URL based on device - synchronous and simple
  const getOptimalVideoUrl = useCallback(() => {
    const baseUrl = "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/";
    
    let quality: VideoQuality;
    let filename: string;
    
    // Simple, reliable device-based selection
    if (device.isIOS || device.isMobile) {
      quality = 'Mobile';
      filename = 'HomePageVideoMobile.mp4';
    } else {
      quality = 'SD';
      filename = 'HomePageVideoSD.mp4';
    }
    
    setCurrentVideoQuality(quality);
    const url = `${baseUrl}${filename}`;
    
    console.log('Video Quality Selection:', { 
      isDesktop: device.isDesktop, 
      isMobile: device.isMobile, 
      isIOS: device.isIOS,
      selectedQuality: quality,
      url: url
    });
    
    return url;
  }, [device]);

  // Simplified fallback - just try mobile quality
  const handleVideoLoadFailure = useCallback(() => {
    if (currentVideoQuality !== 'Mobile') {
      console.log('Falling back to Mobile quality');
      setCurrentVideoQuality('Mobile');
      const baseUrl = "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/";
      return `${baseUrl}HomePageVideoMobile.mp4`;
    }
    
    console.log('Mobile quality also failed - no more fallbacks');
    return null;
  }, [currentVideoQuality]);

  return {
    currentVideoQuality,
    getOptimalVideoUrl,
    handleVideoLoadFailure
  };
};
