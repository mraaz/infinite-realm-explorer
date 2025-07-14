
import { useEffect, useRef, useState } from "react";
import useOnScreen from "@/hooks/useOnScreen";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useVideoQuality } from "@/hooks/useVideoQuality";
import { VideoPlayer } from "./video/VideoPlayer";
import { VideoOverlay } from "./video/VideoOverlay";
import { VideoControls } from "./video/VideoControls";
import { VideoInteractionOverlays } from "./video/VideoInteractionOverlays";
import { VideoPoster } from "./video/VideoPoster";

const HeroVideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(sectionRef, { threshold: 0.3 });
  const device = useDeviceDetection();
  const { currentVideoQuality, getOptimalVideoUrl, handleVideoLoadFailure } = useVideoQuality(device);
  
  // Simplified state management
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [userConsentToLoad, setUserConsentToLoad] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const [videoSrc, setVideoSrc] = useState<string>("");

  // Initialize video source immediately based on device
  useEffect(() => {
    // Auto-consent for non-iOS devices
    if (!device.isIOS) {
      setUserConsentToLoad(true);
    }
    
    // Set video source immediately when device detection is ready
    if (userConsentToLoad || !device.isIOS) {
      const optimalUrl = getOptimalVideoUrl();
      setVideoSrc(optimalUrl);
      setShowPoster(false);
      console.log('Video source set:', optimalUrl);
    }
  }, [device.isIOS, userConsentToLoad, getOptimalVideoUrl]);

  // Video event handlers
  const handleCanPlay = () => {
    console.log(`Video can play - Quality: ${currentVideoQuality}`);
    setIsLoaded(true);
    setHasError(false);
  };

  const handleLoadStart = () => {
    console.log(`Video load started - Quality: ${currentVideoQuality}`);
  };

  const handleLoadedData = () => {
    console.log(`Video data loaded - Quality: ${currentVideoQuality}`);
    setIsLoaded(true);
  };

  const handleError = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = videoRef.current;
    const error = video?.error;
    
    console.error(`Video error (${currentVideoQuality}):`, {
      errorCode: error?.code,
      errorMessage: error?.message,
      currentSrc: video?.currentSrc,
      videoSrc: videoSrc
    });
    
    // Try fallback quality
    const fallbackUrl = handleVideoLoadFailure();
    if (fallbackUrl) {
      console.log('Trying fallback URL:', fallbackUrl);
      setVideoSrc(fallbackUrl);
      setHasError(false);
    } else {
      console.log('No more fallbacks available');
      setHasError(true);
    }
  };

  const handleProgress = () => {
    // Simple progress tracking
  };

  // Autoplay when video is loaded and in view
  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasError || needsUserInteraction || !isLoaded || !videoSrc) return;

    if (isOnScreen) {
      video.muted = true;
      setIsMuted(true);
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log(`Autoplay successful - Quality: ${currentVideoQuality}`);
        }).catch((error) => {
          console.log('Autoplay prevented:', error.name);
          if (error.name === "NotAllowedError") {
            setNeedsUserInteraction(true);
          }
        });
      }
    } else {
      video.pause();
    }
  }, [isOnScreen, isLoaded, hasError, needsUserInteraction, currentVideoQuality, videoSrc]);

  const handleUserLoadVideo = () => {
    setUserConsentToLoad(true);
    const optimalUrl = getOptimalVideoUrl();
    setVideoSrc(optimalUrl);
    setShowPoster(false);
  };

  const handleUserPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    setNeedsUserInteraction(false);
    video.muted = true;
    setIsMuted(true);
    
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log(`User play successful - Quality: ${currentVideoQuality}`);
      }).catch((error) => {
        console.error('User play failed:', error);
        setHasError(true);
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Error fallback
  if (hasError) {
    return (
      <section ref={sectionRef} className="text-center mb-8 md:mb-16 px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 md:mb-6">
          Discover Your{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            5-Year Future
          </span>
        </h2>
        <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-4">
          Get a personalised snapshot of where your life is heading. Our AI
          analyses your current situation across four key pillars to project
          your path forward.
        </p>
        <div className="text-xs text-red-400 bg-red-900/20 p-3 rounded max-w-md mx-auto mb-4">
          <div className="mb-2">Video temporarily unavailable</div>
          <button 
            onClick={() => {
              setHasError(false);
              setVideoSrc('');
              setUserConsentToLoad(true);
            }}
            className="text-blue-400 hover:text-blue-300 underline text-xs"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef} 
      className="relative mb-8 md:mb-16 lg:mb-24 overflow-hidden rounded-xl md:rounded-2xl mx-4 md:mx-0"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Container */}
      <div className={`relative w-full bg-gray-900 ${device.isMobile ? 'aspect-[4/3]' : 'aspect-video'}`}>
        <VideoPoster showPoster={showPoster} />
        
        <VideoPlayer
          ref={videoRef}
          isMuted={isMuted}
          isMobile={device.isMobile}
          showPoster={showPoster}
          videoSrc={videoSrc}
          onLoadStart={handleLoadStart}
          onLoadedData={handleLoadedData}
          onCanPlay={handleCanPlay}
          onError={handleError}
          onProgress={handleProgress}
        />

        <VideoOverlay device={device} />

        <VideoInteractionOverlays
          device={device}
          isVideoLoading={false}
          currentVideoQuality={currentVideoQuality}
          userConsentToLoad={userConsentToLoad}
          needsUserInteraction={needsUserInteraction}
          onUserLoadVideo={handleUserLoadVideo}
          onUserPlay={handleUserPlay}
        />

        {/* Audio Controls */}
        {isLoaded && !hasError && !needsUserInteraction && userConsentToLoad && (
          <VideoControls
            isMuted={isMuted}
            isMobile={device.isMobile}
            showControls={showControls}
            onToggleMute={toggleMute}
          />
        )}

        {/* Debug Info (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded">
            <div>Device: {device.isDesktop ? 'Desktop' : device.isMobile ? 'Mobile' : 'Tablet'} | {device.isIOS ? 'iOS' : 'Non-iOS'}</div>
            <div>Quality: {currentVideoQuality} | Loaded: {isLoaded ? 'Yes' : 'No'}</div>
            <div>Source: {videoSrc || 'Not set'}</div>
            <div>Consent: {userConsentToLoad ? 'Yes' : 'No'} | Error: {hasError ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroVideoSection;
