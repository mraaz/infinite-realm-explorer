import { useEffect, useRef, useState } from "react";
import useOnScreen from "@/hooks/useOnScreen";

const HeroVideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(sectionRef, { threshold: 0.3 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Handle play/pause based on focus
  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasError) return;

    if (isOnScreen && isLoaded) {
      video.play().catch(() => {
        // Fallback if auto-play fails
        setHasError(true);
      });
    } else {
      video.pause();
    }
  }, [isOnScreen, isLoaded, hasError]);

  const handleVideoLoad = () => {
    setIsLoaded(true);
  };

  const handleVideoError = () => {
    setHasError(true);
  };

  // Fallback to text-only hero if video fails
  if (hasError) {
    return (
      <section ref={sectionRef} className="text-center mb-16 md:mb-24">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
          Discover Your{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            5-Year Future
          </span>
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Get a personalised snapshot of where your life is heading. Our AI
          analyses your current situation across four key pillars to project
          your path forward.
        </p>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative mb-16 md:mb-24 overflow-hidden rounded-2xl">
      {/* Video Container */}
      <div className="relative w-full aspect-video bg-gray-900">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-center justify-center">
          <div className="text-center px-4 max-w-4xl">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
              Discover Your{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                5-Year Future
              </span>
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-md">
              Get a personalised snapshot of where your life is heading. Our AI
              analyses your current situation across four key pillars to project
              your path forward.
            </p>
          </div>
        </div>

        {/* Loading state */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-pulse bg-gray-700 h-8 w-64 rounded mb-4 mx-auto"></div>
              <div className="animate-pulse bg-gray-700 h-4 w-96 rounded mx-auto"></div>
            </div>
          </div>
        )}

        {/* Subtle video controls indicator */}
        {isLoaded && !hasError && (
          <div className="absolute bottom-4 right-4 text-white/60 text-xs">
            {isOnScreen ? "Playing" : "Paused"}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroVideoSection;