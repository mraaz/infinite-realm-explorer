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

  // Detect iOS
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
  }, []);

  // Handle play/pause based on focus
  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasError || needsUserInteraction) return;

    if (isOnScreen && isLoaded) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Auto-play prevented:", error);
          if (isIOS || error.name === "NotAllowedError") {
            setNeedsUserInteraction(true);
          } else {
            setHasError(true);
          }
        });
      }
    } else {
      video.pause();
    }
  }, [isOnScreen, isLoaded, hasError, needsUserInteraction, isIOS]);

  const handleVideoLoad = () => {
    setIsLoaded(true);
  };

  const handleVideoError = () => {
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

    setNeedsUserInteraction(false);
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log("Manual play failed:", error);
        setHasError(true);
      });
    }
  };

  // Fallback to text-only hero if video fails
  if (hasError) {
    return (
      <section ref={sectionRef} className="text-center mb-8 md:mb-16 px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 md:mb-6">
          Discover Your{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            5-Year Future
          </span>
        </h2>
        <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Get a personalised snapshot of where your life is heading. Our AI
          analyses your current situation across four key pillars to project
          your path forward.
        </p>
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
          webkit-playsinline="true"
          autoPlay={!isIOS}
          controls={needsUserInteraction}
          preload={isMobile || isIOS ? "none" : "metadata"}
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          poster="/placeholder.svg"
        >
          <source
            src="https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/HomePageVideo.mp4"
            type="video/mp4"
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

        {/* Tap to Play Overlay for iOS/blocked autoplay */}
        {needsUserInteraction && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
            <Button
              onClick={handleUserPlay}
              size="lg"
              className="bg-white/90 hover:bg-white text-black hover:text-black min-w-[64px] min-h-[64px] rounded-full shadow-lg"
              aria-label="Play video"
            >
              <Play className="h-8 w-8 ml-1" />
            </Button>
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

        {/* Loading state */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="animate-pulse bg-gray-700 h-6 sm:h-8 w-48 sm:w-64 rounded mb-3 sm:mb-4 mx-auto"></div>
              <div className="animate-pulse bg-gray-700 h-3 sm:h-4 w-64 sm:w-96 rounded mx-auto"></div>
            </div>
          </div>
        )}

        {/* Status indicator - hidden on mobile for cleaner look */}
        {isLoaded && !hasError && !isMobile && (
          <div className="absolute bottom-4 right-4 text-white/60 text-xs bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
            {isOnScreen ? "Playing" : "Paused"}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroVideoSection;