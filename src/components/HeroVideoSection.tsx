import { useEffect, useRef, useState } from "react";
import useOnScreen from "@/hooks/useOnScreen";
import { useIsMobile } from "@/hooks/use-mobile";
import { Volume2, VolumeX, Play, Wifi, WifiOff } from "lucide-react";
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
  const [videoLoadError, setVideoLoadError] = useState<string>("");
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [userConsentToLoad, setUserConsentToLoad] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow' | 'unknown'>('unknown');
  const [showPoster, setShowPoster] = useState(true);
  const [currentVideoQuality, setCurrentVideoQuality] = useState<'HD' | 'SD' | 'Mobile'>('Mobile');
  const [isDesktop, setIsDesktop] = useState(false);

  // Enhanced device detection with better desktop/iOS distinction
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const maxTouchPoints = navigator.maxTouchPoints;
    
    // More precise iOS detection - exclude Mac Desktop
    const isIOSDevice = 
      /iPad|iPhone|iPod/.test(userAgent) ||
      (/Safari/.test(userAgent) && /Mobile/.test(userAgent) && !/Mac/.test(platform)) ||
      /iPhone OS|iOS/.test(userAgent);
    
    // Desktop detection - includes Mac Desktop with Chrome
    const isDesktopDevice = 
      !isMobile && 
      !isIOSDevice &&
      (window.innerWidth >= 1024) &&
      (
        /Mac/.test(platform) ||
        /Win/.test(platform) ||
        /Linux/.test(platform) ||
        /Chrome/.test(userAgent) ||
        /Firefox/.test(userAgent) ||
        /Safari/.test(userAgent) && /Mac/.test(platform)
      );
    
    setIsIOS(isIOSDevice);
    setIsDesktop(isDesktopDevice);
    
    console.log('Device Detection:', { 
      isIOSDevice, 
      isDesktopDevice, 
      isMobile, 
      userAgent: userAgent.substring(0, 50) + '...', 
      platform,
      screenWidth: window.innerWidth
    });
    
    // For iOS devices, require user consent before loading
    if (isIOSDevice) {
      setUserConsentToLoad(false);
      setShowPoster(true);
    } else {
      setUserConsentToLoad(true);
    }
  }, [isMobile]);

  // Enhanced connection speed detection with desktop priority
  useEffect(() => {
    const detectConnectionSpeed = () => {
      // Use Navigator connection API if available
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn) {
          const effectiveType = conn.effectiveType;
          const downlink = conn.downlink;
          
          console.log('Connection Info:', { effectiveType, downlink });
          
          if (effectiveType === '4g' && downlink > 10) {
            setConnectionSpeed('fast');
          } else if (effectiveType === '4g' && downlink > 2) {
            setConnectionSpeed('fast');
          } else if (effectiveType === '3g' || effectiveType === 'slow-2g' || effectiveType === '2g') {
            setConnectionSpeed('slow');
          } else {
            setConnectionSpeed('unknown');
          }
          return;
        }
      }
      
      // Enhanced fallback logic - prioritize desktop as fast
      if (isDesktop) {
        setConnectionSpeed('fast');
      } else if (isMobile || isIOS) {
        setConnectionSpeed('slow');
      } else {
        setConnectionSpeed('unknown');
      }
    };

    detectConnectionSpeed();
  }, [isMobile, isIOS, isDesktop]);

  // Smart video quality selection with desktop priority
  const getOptimalVideoUrl = () => {
    const baseUrl = "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/";
    
    console.log('Quality Selection Logic:', { 
      isDesktop, 
      isMobile, 
      isIOS, 
      connectionSpeed, 
      screenWidth: window.innerWidth 
    });
    
    // iOS devices always get mobile quality
    if (isIOS) {
      setCurrentVideoQuality('Mobile');
      return `${baseUrl}HomePageVideoMobile.mp4`;
    }
    
    // Desktop gets HD by default, SD for slow connections
    if (isDesktop) {
      if (connectionSpeed === 'slow') {
        setCurrentVideoQuality('SD');
        return `${baseUrl}HomePageVideoSD.mp4`;
      } else {
        setCurrentVideoQuality('HD');
        return `${baseUrl}HomePageVideoHD.mp4`;
      }
    }
    
    // Mobile phones get mobile quality
    if (isMobile) {
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
  };

  // Smart video loading strategy with quality fallback
  const loadVideo = async () => {
    const video = videoRef.current;
    if (!video || isVideoLoading) return;

    console.log('Starting video load process...', { 
      isIOS, 
      isDesktop,
      connectionSpeed, 
      userConsentToLoad, 
      screenWidth: window.innerWidth,
      selectedQuality: currentVideoQuality 
    });
    
    setIsVideoLoading(true);
    setVideoLoadError('');

    try {
      const videoSrc = getOptimalVideoUrl();
      
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
      await handleVideoLoadFailure();
    }
  };

  // Handle video load failure with quality downgrade
  const handleVideoLoadFailure = async () => {
    const baseUrl = "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/";
    const video = videoRef.current;
    if (!video) return;

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
        // Mobile quality failed - show error
        setVideoLoadError('Unable to load video');
        setHasError(true);
        setIsVideoLoading(false);
        return;
      }

      const source = video.querySelector('source[type="video/mp4"]') as HTMLSourceElement;
      if (source) {
        source.src = fallbackUrl;
        video.load();
      }
    } catch (error) {
      console.error('Fallback video load failed:', error);
      setVideoLoadError('Failed to load video');
      setHasError(true);
      setIsVideoLoading(false);
    }
  };

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      console.log(`Video can play - Quality: ${currentVideoQuality}`);
      setIsLoaded(true);
      setIsVideoLoading(false);
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

    const handleError = async (event: Event) => {
      const error = video.error;
      const errorMsg = error ? 
        `Error ${error.code}: ${error.message}` : 
        'Unknown video error';
      console.error(`Video error (${currentVideoQuality}):`, errorMsg);
      
      // Try fallback quality before showing error
      if (currentVideoQuality !== 'Mobile') {
        await handleVideoLoadFailure();
      } else {
        setVideoLoadError(errorMsg);
        setHasError(true);
        setIsVideoLoading(false);
      }
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (bufferedEnd / duration > 0.1) { // 10% buffered
          setIsVideoLoading(false);
        }
      }
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('progress', handleProgress);
    };
  }, [currentVideoQuality]);

  // Auto-load video for non-iOS devices when in view
  useEffect(() => {
    if (isOnScreen && !isIOS && userConsentToLoad && !isLoaded && !isVideoLoading) {
      loadVideo();
    }
  }, [isOnScreen, isIOS, userConsentToLoad, isLoaded, isVideoLoading]);

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
        {/* Poster Image - Always show for iOS until user consents */}
        {showPoster && (
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

        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-300 ${showPoster ? 'opacity-0' : 'opacity-100'}`}
          muted={isMuted}
          loop
          playsInline
          preload="none"
          poster="/placeholder.svg"
          controlsList="nodownload"
          disablePictureInPicture={isIOS}
        >
          <source
            src=""
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Enhanced Responsive Overlay for text content */}
        <div className={`absolute inset-0 ${
          isMobile 
            ? 'bg-gradient-to-t from-black/90 via-black/20 to-transparent' 
            : 'bg-gradient-to-t from-black/80 via-black/30 to-transparent'
        } flex ${
          isMobile ? 'items-end pb-8' : 'items-end pb-16'
        } justify-center`}>
          <div className="text-center px-4 sm:px-6 max-w-4xl">
            <h2 className={`${
              isMobile 
                ? 'text-xl sm:text-2xl md:text-3xl' 
                : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl'
            } font-extrabold text-white tracking-tight mb-3 sm:mb-4 md:mb-6 drop-shadow-lg leading-tight`}>
              Discover Your{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                5-Year Future
              </span>
            </h2>
            <p className={`${
              isMobile 
                ? 'text-xs sm:text-sm' 
                : 'text-sm sm:text-base md:text-lg'
            } text-gray-200 max-w-2xl mx-auto drop-shadow-md leading-relaxed`}>
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
              {currentVideoQuality === 'Mobile' 
                ? "Optimized mobile version (7MB)" 
                : `Loading ${currentVideoQuality} quality`
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
        {isVideoLoading && (
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
          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded">
            <div>Device: {isDesktop ? 'Desktop' : isMobile ? 'Mobile' : 'Tablet'} | {isIOS ? 'iOS' : 'Non-iOS'}</div>
            <div>Connection: {connectionSpeed} | Screen: {window.innerWidth}px</div>
            <div>Quality: {currentVideoQuality}</div>
            <div>Consent: {userConsentToLoad ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroVideoSection;
