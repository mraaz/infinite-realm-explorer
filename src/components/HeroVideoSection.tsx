
import React, { useRef, useState, useEffect } from "react";
import useOnScreen from "@/hooks/useOnScreen";
import { useIsMobile } from "@/hooks/use-mobile";
import { Volume2, VolumeX, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroVideoSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isOnScreen = useOnScreen(sectionRef, { threshold: 0.3 });
  const isMobile = useIsMobile();
  
  // Simplified state management
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Get video URL with automatic fallback
  const getVideoUrl = () => {
    if (isMobile || window.innerWidth < 768) {
      return "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/HomePageVideoMobile.mp4";
    } else if (window.innerWidth >= 1920) {
      return "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/HomePageVideoHD.mp4";  
    } else {
      return "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/HomePageVideoSD.mp4";
    }
  };

  const handleReady = () => {
    console.log('🎬 [HeroVideo] Video ready');
    setIsReady(true);
    setHasError(false);
    setLoadingTimeout(false);
  };

  const handleError = (error: any) => {
    console.error('❌ [HeroVideo] Video error:', error);
    setHasError(true);
    setIsReady(false);
  };

  const handlePlay = () => {
    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleUserPlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  // Loading timeout - prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isReady && !hasError) {
        console.warn('⏰ [HeroVideo] Loading timeout - showing fallback');
        setLoadingTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [isReady, hasError]);

  // Control playing state based on visibility
  useEffect(() => {
    if (videoRef.current && isReady) {
      if (isOnScreen && !hasError) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isOnScreen, isReady, hasError]);

  // Error or timeout fallback
  if (hasError || loadingTimeout) {
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
        <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded max-w-md mx-auto">
          Video temporarily unavailable. Please refresh the page.
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
      <div className={`relative w-full bg-gray-900 ${isMobile ? 'aspect-[4/3]' : 'aspect-video'}`}>
        <video
          ref={videoRef}
          src={getVideoUrl()}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay={isOnScreen}
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          onLoadedData={handleReady}
          onError={handleError}
          onPlay={handlePlay}
          onPause={handlePause}
        />

        {/* Overlay for text content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-center justify-center z-10">
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

        {/* Play Button Overlay - Show when not playing */}
        {!playing && isReady && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-center px-4">
            <Button
              onClick={handleUserPlay}
              size="lg"
              className="bg-white/95 hover:bg-white text-black hover:text-black min-w-[100px] min-h-[100px] rounded-full shadow-2xl mb-6 transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Play video"
            >
              <Play className="h-12 w-12 ml-1" />
            </Button>
            <p className="text-white text-base font-medium opacity-95 max-w-xs mb-2">
              {isMobile ? "Tap to play video" : "Click to play video"}
            </p>
          </div>
        )}

        {/* Loading State */}
        {!isReady && !hasError && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-15">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
              <p className="text-sm">Loading video...</p>
            </div>
          </div>
        )}

        {/* Audio Controls */}
        {isReady && !hasError && (
          <div className={`absolute bottom-3 sm:bottom-4 left-3 sm:left-4 transition-opacity duration-300 z-30 ${showControls || isMobile ? 'opacity-100' : 'opacity-60'}`}>
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

        {/* Debug Info (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 right-2 bg-black/90 text-white text-xs p-3 rounded-lg border border-white/20 z-40">
            <div className="font-bold text-green-400">🎬 React Player Debug</div>
            <div>Device: {isMobile ? 'Mobile' : 'Desktop'}</div>
            <div>Screen: {window.innerWidth}px</div>
            <div>Video: {getVideoUrl().includes('HD') ? 'HD' : getVideoUrl().includes('SD') ? 'SD' : 'Mobile'}</div>
            <div>Status: {!isReady ? 'Loading' : hasError ? 'Error' : playing ? 'Playing' : 'Ready'}</div>
            <div>OnScreen: {isOnScreen ? '✅' : '❌'}</div>
            <div>Muted: {isMuted ? '🔇' : '🔊'}</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroVideoSection;
