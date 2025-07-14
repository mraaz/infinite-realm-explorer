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
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState<string>("");
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [userConsentToLoad, setUserConsentToLoad] = useState(false);
  const [showPoster, setShowPoster] = useState(true);

  // Auto-consent for non-iOS devices
  useEffect(() => {
    if (device.isIOS) {
      setUserConsentToLoad(false);
      setShowPoster(true);
    } else {
      setUserConsentToLoad(true);
    }
  }, [device.isIOS]);

  // Smart video loading strategy with quality fallback and enhanced error handling
  const loadVideo = async () => {
    const video = videoRef.current;
    if (!video || isVideoLoading) return;

    console.log('Starting video load process...', { 
      isIOS: device.isIOS, 
      isDesktop: device.isDesktop,
      connectionSpeed: device.connectionSpeed, 
      userConsentToLoad, 
      screenWidth: window.innerWidth,
      selectedQuality: currentVideoQuality 
    });
    
    setIsVideoLoading(true);
    setVideoLoadError('');
    setHasError(false);

    try {
      const videoSrc = getOptimalVideoUrl();
      console.log('Loading video source:', videoSrc);
      
      // Set video source
      const source = video.querySelector('source[type="video/mp4"]') as HTMLSourceElement;
      if (source) {
        source.src = videoSrc;
      }

      // Load the video
      video.load();
      
      // Hide poster once loading starts
      setShowPoster(false);
      
    } catch (error) {
      console.error('Video load failed:', error);
      const fallbackSuccess = await handleVideoLoadFailure(videoRef);
      if (!fallbackSuccess) {
        setVideoLoadError('Unable to load video - all quality levels failed');
        setHasError(true);
        setIsVideoLoading(false);
      }
    }
  };

  // Video event handlers with enhanced error reporting
  const handleCanPlay = () => {
    console.log(`Video can play - Quality: ${currentVideoQuality}`);
    setIsLoaded(true);
    setIsVideoLoading(false);
    setHasError(false);
  };

  const handleLoadStart = () => {
    console.log(`Video load started - Quality: ${currentVideoQuality}`);
    setIsVideoLoading(true);
  };

  const handleLoadedData = () => {
    console.log(`Video data loaded - Quality: ${currentVideoQuality}`);
    setIsLoaded(true);
    setIsVideoLoading(false);
  };

  const handleError = async (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = videoRef.current;
    const error = video?.error;
    
    // Enhanced error reporting with specific error codes
    let errorMsg = 'Unknown video error';
    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMsg = 'Video loading was aborted';
          break;
        case error.MEDIA_ERR_NETWORK:
          errorMsg = 'Network error while loading video';
          break;
        case error.MEDIA_ERR_DECODE:
          errorMsg = 'Video decode error';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMsg = 'Video format not supported';
          break;
        default:
          errorMsg = `Video error code: ${error.code} - ${error.message || 'Unknown error'}`;
      }
    }
    
    console.error(`Video error (${currentVideoQuality}):`, {
      errorCode: error?.code,
      errorMessage: error?.message,
      networkState: video?.networkState,
      readyState: video?.readyState,
      currentSrc: video?.currentSrc
    });
    
    // Try fallback quality before showing error
    const fallbackSuccess = await handleVideoLoadFailure(videoRef);
    if (!fallbackSuccess) {
      setVideoLoadError(errorMsg);
      setHasError(true);
      setIsVideoLoading(false);
    }
  };

  const handleProgress = () => {
    const video = videoRef.current;
    if (video && video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const duration = video.duration;
      if (bufferedEnd / duration > 0.1) { // 10% buffered
        setIsVideoLoading(false);
      }
    }
  };

  // Auto-load video for non-iOS devices when in view
  useEffect(() => {
    if (isOnScreen && !device.isIOS && userConsentToLoad && !isLoaded && !isVideoLoading) {
      loadVideo();
    }
  }, [isOnScreen, device.isIOS, userConsentToLoad, isLoaded, isVideoLoading]);

  // Autoplay when video is loaded and in view
  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasError || needsUserInteraction || !isLoaded) return;

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
  }, [isOnScreen, isLoaded, hasError, needsUserInteraction, currentVideoQuality]);

  const handleUserLoadVideo = () => {
    setUserConsentToLoad(true);
    loadVideo();
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

  // Enhanced error fallback with retry option
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
        {videoLoadError && (
          <div className="text-xs text-red-400 bg-red-900/20 p-3 rounded max-w-md mx-auto mb-4">
            <div className="mb-2">Video Error: {videoLoadError}</div>
            <button 
              onClick={() => {
                setHasError(false);
                setVideoLoadError('');
                loadVideo();
              }}
              className="text-blue-400 hover:text-blue-300 underline text-xs"
            >
              Try Again
            </button>
          </div>
        )}
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
          onLoadStart={handleLoadStart}
          onLoadedData={handleLoadedData}
          onCanPlay={handleCanPlay}
          onError={handleError}
          onProgress={handleProgress}
        />

        <VideoOverlay device={device} />

        <VideoInteractionOverlays
          device={device}
          isVideoLoading={isVideoLoading}
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

        {/* Enhanced Quality Indicator (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded">
            <div>Device: {device.isDesktop ? 'Desktop' : device.isMobile ? 'Mobile' : 'Tablet'} | {device.isIOS ? 'iOS' : 'Non-iOS'}</div>
            <div>Connection: {device.connectionSpeed} | Screen: {window.innerWidth}px</div>
            <div>Quality: {currentVideoQuality} | Loaded: {isLoaded ? 'Yes' : 'No'}</div>
            <div>Consent: {userConsentToLoad ? 'Yes' : 'No'} | Error: {hasError ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroVideoSection;
