
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface VideoControlsProps {
  isMuted: boolean;
  isMobile: boolean;
  showControls: boolean;
  onToggleMute: () => void;
}

export const VideoControls = ({ isMuted, isMobile, showControls, onToggleMute }: VideoControlsProps) => {
  return (
    <div className={`absolute bottom-3 sm:bottom-4 left-3 sm:left-4 transition-opacity duration-300 ${showControls || isMobile ? 'opacity-100' : 'opacity-60'}`}>
      <Button
        variant="secondary"
        size={isMobile ? "default" : "sm"}
        onClick={onToggleMute}
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
  );
};
