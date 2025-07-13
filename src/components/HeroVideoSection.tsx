import { useEffect, useRef, useState } from "react";
import useOnScreen from "@/hooks/useOnScreen";
import { useIsMobile } from "@/hooks/use-mobile";
import { Volume2, VolumeX, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroVideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(sectionRef, { threshold: 0.3 });
  const isMobile = useIsMobile();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Enhanced iOS detection with more comprehensive checks
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
    
    const debugMsg = `iOS Detection: ${isIOSDevice}, UserAgent: ${userAgent.substring(0, 50)}..., Platform: ${platform}, TouchPoints: ${maxTouchPoints}`;
    console.log(debugMsg);
    setDebugInfo(prev => [...prev, debugMsg]);
  }, []);

  // Comprehensive video event listeners for iOS debugging
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const logEvent = (eventName: string, data?: any) => {
      const msg = `Video Event [${eventName}]: ${data ? JSON.stringify(data) : 'triggered'}`;
      console.log(msg);
      setDebugInfo(prev => [...prev.slice(-9), msg]); // Keep last 10 debug messages
    };

    const handleCanPlay = () => {
      logEvent('canplay', { readyState: video.readyState, networkState: video.networkState });
      setIsVideoReady(true);
      setIsLoaded(true);
    };

    const handleCanPlayThrough = () => {
      logEvent('canplaythrough', { duration: video.duration, buffered: video.buffered.length });
    };

    const handleLoadStart = () => {
      logEvent('loadstart', { src: video.currentSrc });
    };

    const handleLoadedMetadata = () => {
      logEvent('loadedmetadata', { 
        duration: video.duration, 
        videoWidth: video.videoWidth, 
        videoHeight: video.videoHeight 
      });
    };

    const handleSuspend = () => {
      logEvent('suspend', 'iOS loading suspended');
    };

    const handleWaiting = () => {
      logEvent('waiting', 'buffering');
    };

    const handleError = (event: Event) => {
      const error = video.error;
      const errorMsg = error ? 
        `Code: ${error.code}, Message: ${error.message}` : 
        'Unknown video error';
      logEvent('error', errorMsg);
      setVideoLoadError(errorMsg);
      setHasError(true);
    };

    const handleStalled = () => {
      logEvent('stalled', 'network stalled');
    };

    const handleAbort = () => {
      logEvent('abort', 'loading aborted');
    };

    // Add all event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('suspend', handleSuspend);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('abort', handleAbort);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('suspend', handleSuspend);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('abort', handleAbort);
    };
  }, []);

  // Unified autoplay strategy for all devices with proper iOS handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasError || needsUserInteraction) return;

    if (isOnScreen && (isLoaded || isVideoReady)) {
      // Always attempt autoplay with muted=true for all devices
      video.muted = true;
      setIsMuted(true);
      
      console.log('Attempting autoplay...', { isIOS, readyState: video.readyState });
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Autoplay successful');
          setDebugInfo(prev => [...prev.slice(-9), 'Autoplay successful']);
        }).catch((error) => {
          console.log('Autoplay prevented:', error.name, error.message);
          setDebugInfo(prev => [...prev.slice(-9), `Autoplay failed: ${error.name}`]);
          
          // Show user interaction prompt for any autoplay failure
          if (error.name === "NotAllowedError" || 
              error.name === "NotSupportedError" ||
              error.name === "AbortError") {
            setNeedsUserInteraction(true);
          } else {
            console.error('Unexpected video play error:', error);
            setHasError(true);
          }
        });
      }
    } else if (!isOnScreen) {
      video.pause();
    }
  }, [isOnScreen, isLoaded, isVideoReady, hasError, needsUserInteraction, isIOS]);

  const handleVideoLoad = () => {
    console.log('Video loaded event fired');
    setIsLoaded(true);
  };

  const handleVideoError = (event: any) => {
    const errorDetail = event.target?.error ? 
      `Error ${event.target.error.code}: ${event.target.error.message}` :
      'Unknown video error';
    console.error('Video error event:', errorDetail);
    setVideoLoadError(errorDetail);
    setHasError(true);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleUserPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    console.log('User initiated play');
    setNeedsUserInteraction(false);
    
    // Start muted for better iOS compatibility
    video.muted = true;
    setIsMuted(true);
    
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('User play successful');
        setDebugInfo(prev => [...prev.slice(-9), 'User play successful']);
      }).catch((error) => {
        console.error('User play failed:', error);
        setVideoLoadError(`User play failed: ${error.message}`);
        setHasError(true);
      });
    }
  };

  // Enhanced fallback with debugging info
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
          <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded max-w-md mx-auto">
            Video Error: {videoLoadError}
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
      <div className={`relative w-full bg-gray-900 ${isMobile ? 'aspect-[4/3]' : 'aspect-video'}`}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => {
            console.log('Video loaded event fired');
            setIsLoaded(true);
          }}
          onError={(event: any) => {
            const errorDetail = event.target?.error ? 
              `Error ${event.target.error.code}: ${event.target.error.message}` :
              'Unknown video error';
            console.error('Video error event:', errorDetail);
            setVideoLoadError(errorDetail);
            setHasError(true);
          }}
          poster="/placeholder.svg"
          controlsList="nodownload"
          disablePictureInPicture={isIOS}
        >
          <source
            src="https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/HomePageVideo.mp4"
            type="video/mp4"
          />
          <source
            src="https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/HomePageVideo.webm"
            type="video/webm"
          />
          Your browser does not support the video tag.
        </video>

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

        {/* Enhanced iOS-friendly Tap to Play Overlay */}
        {needsUserInteraction && (
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
            {isIOS && (
              <p className="text-white/60 text-sm max-w-xs">
                Video will start muted for the best experience
              </p>
            )}
          </div>
        )}

        {/* Audio Controls */}
        {isLoaded && !hasError && !needsUserInteraction && (
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

        {/* Enhanced loading state with iOS-specific messaging */}
        {!isLoaded && !isVideoReady && !hasError && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="animate-pulse bg-gray-700 h-6 sm:h-8 w-48 sm:w-64 rounded mb-3 sm:mb-4 mx-auto"></div>
              <div className="animate-pulse bg-gray-700 h-3 sm:h-4 w-64 sm:w-96 rounded mx-auto mb-2"></div>
              {isIOS && (
                <p className="text-gray-400 text-xs mt-4">
                  Optimizing video for iOS Safari...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Debug info for development (remove in production) */}
        {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded max-w-xs max-h-32 overflow-y-auto">
            <div className="font-bold mb-1">Debug Info:</div>
            {debugInfo.slice(-5).map((info, index) => (
              <div key={index} className="truncate">{info}</div>
            ))}
          </div>
        )}

        {/* Status indicator - enhanced for iOS */}
        {isLoaded && !hasError && !isMobile && !needsUserInteraction && (
          <div className="absolute bottom-4 right-4 text-white/60 text-xs bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
            {isOnScreen ? "Playing" : "Paused"} {isIOS ? "(iOS)" : ""}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroVideoSection;
