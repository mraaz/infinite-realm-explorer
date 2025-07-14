
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
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [userConsentToLoad, setUserConsentToLoad] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState<string>("");
  
  // Get video info and initialize immediately  
  const videoInfo = getOptimalVideoUrl();
  const [currentVideoSrc, setCurrentVideoSrc] = useState(videoInfo.url);
  const [currentQuality, setCurrentQuality] = useState(videoInfo.quality);

  // Initialize video source and consent logic
  useEffect(() => {
    const newVideoInfo = getOptimalVideoUrl();
    setCurrentVideoSrc(newVideoInfo.url);
    setCurrentQuality(newVideoInfo.quality);
    
    // Desktop: No consent needed, immediate load
    // iOS: Requires explicit consent
    if (isIOS) {
      setUserConsentToLoad(false);
      setShowPoster(true);
    } else {
      setUserConsentToLoad(true);
      setShowPoster(false);
    }
    
    console.log('Video initialized:', {
      quality: newVideoInfo.quality,
      size: newVideoInfo.size,
      url: newVideoInfo.url,
      isIOS,
      isMobile,
      connectionSpeed,
      screenWidth: window.innerWidth,
      consentNeeded: isIOS
    });
  }, [connectionSpeed, isIOS, isMobile]);

  // Video event handlers
  const handleCanPlay = () => {
    console.log(`Video can play - Quality: ${currentQuality}`);
    setIsLoaded(true);
    setIsVideoLoading(false);
    setShowPoster(false);
  };

  const handleLoadStart = () => {
    console.log(`Video load started - Quality: ${currentQuality}`);
    setIsVideoLoading(true);
    setShowPoster(false);
  };

  const handleLoadedData = () => {
    console.log(`Video data loaded - Quality: ${currentQuality}`);
    setIsLoaded(true);
    setIsVideoLoading(false);
  };

  const handleError = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = event.currentTarget;
    const error = video.error;
    const errorMsg = error ? 
      `Error ${error.code}: ${error.message}` : 
      'Unknown video error';
    console.error(`Video error (${currentQuality}):`, errorMsg);
    
    // Recreate video element for better error recovery
    const recreateVideo = () => {
      if (videoRef.current) {
        const parent = videoRef.current.parentNode;
        const newVideo = videoRef.current.cloneNode(false) as HTMLVideoElement;
        if (parent) {
          parent.replaceChild(newVideo, videoRef.current);
          (videoRef as any).current = newVideo;
        }
      }
    };
    
    // Try fallback quality with video element recreation
    if (currentQuality === 'HD') {
      console.log('HD failed, falling back to SD quality');
      recreateVideo();
      const sdVideoInfo = {
        url: "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/HomePageVideoSD.mp4",
        quality: 'SD' as const,
        size: '29MB'
      };
      setCurrentVideoSrc(sdVideoInfo.url);
      setCurrentQuality(sdVideoInfo.quality);
      setIsLoaded(false);
      setIsVideoLoading(true);
    } else if (currentQuality === 'SD') {
      console.log('SD failed, falling back to Mobile quality');
      recreateVideo();
      const mobileVideoInfo = {
        url: "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/HomePageVideoMobile.mp4",
        quality: 'Mobile' as const,
        size: '7MB'
      };
      setCurrentVideoSrc(mobileVideoInfo.url);
      setCurrentQuality(mobileVideoInfo.quality);
      setIsLoaded(false);
      setIsVideoLoading(true);
    } else {
      // Mobile quality failed - show error
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

  // Autoplay when video is loaded and in view
  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasError || needsUserInteraction || !isLoaded || !userConsentToLoad) return;

    if (isOnScreen) {
      video.muted = true;
      setIsMuted(true);
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log(`Autoplay successful - Quality: ${currentQuality}`);
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
  }, [isOnScreen, isLoaded, hasError, needsUserInteraction, userConsentToLoad, currentQuality]);

  const handleUserLoadVideo = () => {
    setUserConsentToLoad(true);
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
        console.log(`User play successful - Quality: ${currentQuality}`);
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
        {/* Poster Image - Show for iOS until user consents or while loading */}
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

        <VideoPlayer
          ref={videoRef}
          src={currentVideoSrc}
          className={`w-full h-full object-cover transition-opacity duration-300 ${showPoster ? 'opacity-0' : 'opacity-100'}`}
          muted={isMuted}
          loop
          playsInline
          preload={isIOS ? "none" : "metadata"}
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

        {/* Quality Indicator (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded">
            <div>{isIOS ? 'iOS' : 'Desktop'} | {connectionSpeed} | {window.innerWidth}px</div>
            <div>Quality: {currentQuality} ({videoInfo.size})</div>
            <div>{userConsentToLoad ? 'Loaded' : 'Waiting for consent'}</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroVideoSection;
