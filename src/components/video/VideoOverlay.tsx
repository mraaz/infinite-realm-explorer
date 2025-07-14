
import { DeviceDetection } from "@/hooks/useDeviceDetection";

interface VideoOverlayProps {
  device: DeviceDetection;
}

export const VideoOverlay = ({ device }: VideoOverlayProps) => {
  const { isMobile } = device;
  
  return (
    <div className={`absolute inset-0 ${
      isMobile 
        ? 'bg-gradient-to-t from-black/90 via-black/20 to-transparent' 
        : 'bg-gradient-to-t from-black/80 via-black/30 to-transparent'
    } flex ${
      // Adjusted desktop positioning - move text higher to avoid subtitles
      isMobile ? 'items-end pb-8' : 'items-end pb-24'
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
  );
};
