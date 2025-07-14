
import { forwardRef } from "react";

interface VideoPlayerProps {
  isMuted: boolean;
  isMobile: boolean;
  showPoster: boolean;
  onLoadStart: () => void;
  onLoadedData: () => void;
  onCanPlay: () => void;
  onError: (event: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
  onProgress: () => void;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ isMuted, isMobile, showPoster, onLoadStart, onLoadedData, onCanPlay, onError, onProgress }, ref) => {
    return (
      <video
        ref={ref}
        className={`w-full h-full object-cover transition-opacity duration-300 ${showPoster ? 'opacity-0' : 'opacity-100'}`}
        muted={isMuted}
        loop
        playsInline
        preload="none"
        poster="/placeholder.svg"
        controlsList="nodownload"
        disablePictureInPicture={isMobile}
        onLoadStart={onLoadStart}
        onLoadedData={onLoadedData}
        onCanPlay={onCanPlay}
        onError={onError}
        onProgress={onProgress}
      >
        <source
          src=""
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";
