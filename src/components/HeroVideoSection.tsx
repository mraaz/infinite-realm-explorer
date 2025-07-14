import { useEffect, useRef, useState } from "react";
import useOnScreen from "@/hooks/useOnScreen";
import { useIsMobile } from "@/hooks/use-mobile";
import { Volume2, VolumeX, Play, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVideoQuality } from "@/hooks/useVideoQuality";
import VideoPlayer from "@/components/video/VideoPlayer";

const HeroVideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(sectionRef, { threshold: 0.3 });
  const isMobile = useIsMobile();
  const { getOptimalVideoUrl, connectionSpeed, isIOS } = useVideoQuality();
  
  // Simplified state management
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [userConsentToLoad, setUserConsentToLoad] = useState(!isIOS); // Desktop loads immediately
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState<string>("");
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Single source of truth for video info
  const videoInfo = getOptimalVideoUrl();
  const currentVideoSrc = videoInfo.url;
  const currentQuality = videoInfo.quality;

  // Debug state changes
  useEffect(() => {
    console.log('🎭 [HeroVideo] State Update:', {
      isLoaded,
      hasError,
      isMuted,
      needsUserInteraction,
      userConsentToLoad,
      isVideoLoading,
      videoLoadError,
      currentVideoSrc,
      currentQuality,
      isOnScreen,
      connectionSpeed,
      timestamp: new Date().toISOString()
    });
  }, [isLoaded, hasError, isMuted, needsUserInteraction, userConsentToLoad, isVideoLoading, videoLoadError, currentVideoSrc, currentQuality, isOnScreen, connectionSpeed]);

  // Loading timeout management
  useEffect(() => {
    if (isVideoLoading && userConsentToLoad) {
      console.log('⏰ [HeroVideo] Setting loading timeout (30s)');
      const timeout = setTimeout(() => {
        console.log('⏰ [HeroVideo] Loading timeout reached - showing error');
        setIsVideoLoading(false);
        setVideoLoadError('Video loading timeout - please try refreshing the page');
        setHasError(true);
      }, 30000);
      setLoadingTimeout(timeout);
      
      return () => {
        if (timeout) {
          console.log('⏰ [HeroVideo] Clearing loading timeout');
          clearTimeout(timeout);
        }
      };
    }
  }, [isVideoLoading, userConsentToLoad]);

  // Video event handlers with debugging
  const handleCanPlay = () => {
    console.log(`✅ [HeroVideo] Video can play - Quality: ${currentQuality}`, {
      currentSrc: videoRef.current?.currentSrc,
      duration: videoRef.current?.duration,
      readyState: videoRef.current?.readyState
    });
    
    // Clear loading timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
    
    setIsLoaded(true);
    setIsVideoLoading(false);
  };

  const handleLoadStart = () => {
    console.log(`⏳ [HeroVideo] Video load started - Quality: ${currentQuality}`, {
      currentSrc: videoRef.current?.currentSrc,
      networkState: videoRef.current?.networkState,
      readyState: videoRef.current?.readyState
    });
    setIsVideoLoading(true);
    setHasError(false);
    setVideoLoadError("");
  };

  const handleLoadedData = () => {
    console.log(`📊 [HeroVideo] Video data loaded - Quality: ${currentQuality}`, {
      duration: videoRef.current?.duration,
      buffered: videoRef.current?.buffered.length,
      readyState: videoRef.current?.readyState
    });
    
    // Clear loading timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
    
    setIsLoaded(true);
    setIsVideoLoading(false);
  };

  const handleError = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = event.currentTarget;
    const error = video.error;
    const errorMsg = error ? 
      `Error ${error.code}: ${error.message}` : 
      'Unknown video error';
    
    console.error(`❌ [HeroVideo] Video error (${currentQuality}):`, {
      errorMsg,
      errorCode: error?.code,
      errorMessage: error?.message,
      currentSrc: video.currentSrc,
      networkState: video.networkState,
      readyState: video.readyState
    });
    
    // Clear loading timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
    
    // Simple error handling without video recreation
    console.error('💥 [HeroVideo] Video loading failed - showing error state');
    setVideoLoadError(errorMsg);
    setHasError(true);
    setIsVideoLoading(false);
  };

  const handleProgress = () => {
    const video = videoRef.current;
    if (video && video.buffered.length > 0 && video.duration > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const duration = video.duration;
      const percentage = (bufferedEnd / duration * 100).toFixed(1);
      
      console.log('📈 [HeroVideo] Video progress:', {
        quality: currentQuality,
        bufferedEnd,
        duration,
        percentage: percentage + '%',
        readyState: video.readyState,
        networkState: video.networkState
      });
    }
  };

  // Autoplay when video is loaded and in view
  useEffect(() => {
    const video = videoRef.current;
    
    console.log('🎮 [HeroVideo] Autoplay Effect Check:', {
      hasVideo: !!video,
      hasError,
      needsUserInteraction,
      isLoaded,
      userConsentToLoad,
      isOnScreen,
      canAttemptAutoplay: !!video && !hasError && !needsUserInteraction && isLoaded && userConsentToLoad
    });

    if (!video || hasError || needsUserInteraction || !isLoaded || !userConsentToLoad) return;

    if (isOnScreen) {
      console.log('🎯 [HeroVideo] Attempting autoplay - video is on screen');
      video.muted = true;
      setIsMuted(true);
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log(`✅ [HeroVideo] Autoplay successful - Quality: ${currentQuality}`, {
            currentTime: video.currentTime,
            paused: video.paused,
            muted: video.muted
          });
        }).catch((error) => {
          console.log('🚫 [HeroVideo] Autoplay prevented:', {
            errorName: error.name,
            errorMessage: error.message,
            quality: currentQuality,
            willRequireUserInteraction: error.name === "NotAllowedError"
          });
          if (error.name === "NotAllowedError") {
            setNeedsUserInteraction(true);
          }
        });
      }
    } else {
      console.log('👁️ [HeroVideo] Video not on screen - pausing');
      video.pause();
    }
  }, [isOnScreen, isLoaded, hasError, needsUserInteraction, userConsentToLoad, currentQuality]);

  const handleUserLoadVideo = () => {
    console.log('👆 [HeroVideo] User clicked to load video');
    setUserConsentToLoad(true);
    setIsVideoLoading(true);
  };

  const handleUserPlay = () => {
    console.log('👆 [HeroVideo] User clicked to play video');
    const video = videoRef.current;
    if (!video) return;

    setNeedsUserInteraction(false);
    video.muted = true;
    setIsMuted(true);
    
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log(`✅ [HeroVideo] User play successful - Quality: ${currentQuality}`, {
          currentTime: video.currentTime,
          paused: video.paused
        });
      }).catch((error) => {
        console.error('❌ [HeroVideo] User play failed:', {
          errorName: error.name,
          errorMessage: error.message,
          quality: currentQuality
        });
        setHasError(true);
      });
    }
  };

  const toggleMute = () => {
    console.log('🔊 [HeroVideo] Toggle mute clicked');
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
    console.log('🔊 [HeroVideo] Mute toggled:', { muted: video.muted });
  };

  // Error fallback
  if (hasError) {
    console.log('💥 [HeroVideo] Rendering error fallback');
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
          <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded max-w-md mx-auto">
            Video Error: {videoLoadError}
          </div>
        )}
      </section>
    );
  }

  console.log('🎬 [HeroVideo] Rendering main video section:', {
    userConsentToLoad,
    needsUserInteraction,
    isVideoLoading,
    isLoaded,
    currentQuality,
    isIOS
  });

  return (
    <section 
      ref={sectionRef} 
      className="relative mb-8 md:mb-16 lg:mb-24 overflow-hidden rounded-xl md:rounded-2xl mx-4 md:mx-0"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Container */}
      <div className={`relative w-full bg-gray-900 ${isMobile ? 'aspect-[4/3]' : 'aspect-video'}`}>
        {/* Poster Image - Show for iOS until user consents */}
        {isIOS && !userConsentToLoad && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                <Play className="h-10 w-10 text-white/80" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Interactive Video Preview
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                See how our AI analyzes your life across four key pillars
              </p>
            </div>
          </div>
        )}

        <VideoPlayer
          ref={videoRef}
          src={currentVideoSrc}
          className={`w-full h-full object-cover transition-opacity duration-300 ${(isIOS && !userConsentToLoad) ? 'opacity-0' : 'opacity-100'}`}
          muted={isMuted}
          loop
          playsInline
          preload={isIOS ? "metadata" : "metadata"}
          controlsList="nodownload"
          disablePictureInPicture={isIOS}
          onCanPlay={handleCanPlay}
          onLoadStart={handleLoadStart}
          onLoadedData={handleLoadedData}
          onError={handleError}
          onProgress={handleProgress}
        />

        {/* Overlay for text content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-center justify-center">
          <div className="text-center px-4 sm:px-6 max-w-4xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight mb-3 sm:mb-4 md:mb-6 drop-shadow-lg leading-tight">
              Discover Your{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                5-Year Future
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
              Get a personalised snapshot of where your life is heading. Our AI
              analyses your current situation across four key pillars to project
              your path forward.
            </p>
          </div>
        </div>

        {/* iOS Tap to Load Overlay */}
        {isIOS && !userConsentToLoad && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-center px-4">
            <Button
              onClick={handleUserLoadVideo}
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
              {currentQuality === 'Mobile' 
                ? "Optimized mobile version (7MB)" 
                : `Loading ${currentQuality} quality (${videoInfo.size})`
              }
            </p>
          </div>
        )}

        {/* Tap to Play Overlay */}
        {needsUserInteraction && userConsentToLoad && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-center px-4">
            <Button
              onClick={handleUserPlay}
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
        )}

        {/* Loading State */}
        {isVideoLoading && userConsentToLoad && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-5">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
              <p className="text-sm">
                Loading {currentQuality} quality video...
              </p>
              <p className="text-xs text-gray-300 mt-1">
                ~{videoInfo.size}
              </p>
            </div>
          </div>
        )}

        {/* Audio Controls */}
        {isLoaded && !hasError && !needsUserInteraction && userConsentToLoad && (
          <div className={`absolute bottom-3 sm:bottom-4 left-3 sm:left-4 transition-opacity duration-300 ${showControls || isMobile ? 'opacity-100' : 'opacity-60'}`}>
            <Button
              variant="secondary"
              size={isMobile ? "default" : "sm"}
              onClick={toggleMute}
              className={`bg-black/50 backdrop-blur-sm border-white/20 hover:bg-black/70 text-white hover:text-white transition-all duration-200 ${isMobile ? 'min-w-[44px] min-h-[44px]' : ''}`}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? (
                <VolumeX className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
              ) : (
                <Volume2 className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
              )}
            </Button>
          </div>
        )}

        {/* Enhanced Quality Indicator (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 right-2 bg-black/90 text-white text-xs p-3 rounded-lg border border-white/20">
            <div className="font-bold text-green-400">🎬 Video Debug Info</div>
            <div>Device: {isIOS ? 'iOS' : isMobile ? 'Mobile' : 'Desktop'}</div>
            <div>Connection: {connectionSpeed}</div>
            <div>Screen: {window.innerWidth}px</div>
            <div>Quality: {currentQuality} ({videoInfo.size})</div>
            <div>Status: {userConsentToLoad ? 'Loaded' : 'Waiting for consent'}</div>
            <div>State: {isLoaded ? 'Ready' : isVideoLoading ? 'Loading' : hasError ? 'Error' : 'Pending'}</div>
            <div>OnScreen: {isOnScreen ? '✅' : '❌'}</div>
            {videoRef.current && (
              <div>
                <div>ReadyState: {videoRef.current.readyState}</div>
                <div>NetworkState: {videoRef.current.networkState}</div>
                <div>Duration: {videoRef.current.duration?.toFixed(1)}s</div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroVideoSection;
