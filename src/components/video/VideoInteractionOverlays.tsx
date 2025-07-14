
import { Button } from "@/components/ui/button";
import { Play, Wifi, WifiOff } from "lucide-react";
import { DeviceDetection } from "@/hooks/useDeviceDetection";

interface VideoInteractionOverlaysProps {
  device: DeviceDetection;
  isVideoLoading: boolean;
  currentVideoQuality: 'HD' | 'SD' | 'Mobile';
  userConsentToLoad: boolean;
  needsUserInteraction: boolean;
  onUserLoadVideo: () => void;
  onUserPlay: () => void;
}

export const VideoInteractionOverlays = ({
  device,
  isVideoLoading,
  currentVideoQuality,
  userConsentToLoad,
  needsUserInteraction,
  onUserLoadVideo,
  onUserPlay
}: VideoInteractionOverlaysProps) => {
  const { isIOS, connectionSpeed } = device;

  // iOS Tap to Load Overlay
  if (isIOS && !userConsentToLoad) {
    return (
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-center px-4">
        <Button
          onClick={onUserLoadVideo}
          size="lg"
          className="bg-white/95 hover:bg-white text-black hover:text-black min-w-[100px] min-h-[100px] rounded-full shadow-2xl mb-6 transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Load video"
        >
          {connectionSpeed === 'slow' ? <WifiOff className="h-8 w-8" /> : <Wifi className="h-8 w-8" />}
        </Button>
        <p className="text-white text-base font-medium opacity-95 max-w-xs mb-2">
          Tap to load video
        </p>
        <p className="text-white/60 text-sm max-w-xs">
          {currentVideoQuality === 'Mobile' 
            ? "Optimized mobile version (7MB)" 
            : `Loading ${currentVideoQuality} quality`
          }
        </p>
      </div>
    );
  }

  // Tap to Play Overlay
  if (needsUserInteraction && userConsentToLoad) {
    return (
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-center px-4">
        <Button
          onClick={onUserPlay}
          size="lg"
          className="bg-white/95 hover:bg-white text-black hover:text-black min-w-[100px] min-h-[100px] rounded-full shadow-2xl mb-6 transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Play video"
        >
          <Play className="h-12 w-12 ml-1" />
        </Button>
        <p className="text-white text-base font-medium opacity-95 max-w-xs mb-2">
          {isIOS ? "Tap to play video" : "Click to play video"}
        </p>
      </div>
    );
  }

  // Loading State
  if (isVideoLoading) {
    return (
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-5">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <p className="text-sm">
            Loading {currentVideoQuality} quality video...
          </p>
          <p className="text-xs text-gray-300 mt-1">
            {currentVideoQuality === 'Mobile' && '~7MB'} 
            {currentVideoQuality === 'SD' && '~28MB'}
            {currentVideoQuality === 'HD' && '~41MB'}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
