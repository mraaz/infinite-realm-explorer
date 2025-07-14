
import React, { forwardRef } from 'react';

interface VideoPlayerProps {
  src: string;
  className?: string;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
  controlsList?: string;
  disablePictureInPicture?: boolean;
  onCanPlay?: () => void;
  onLoadStart?: () => void;
  onLoadedData?: () => void;
  onError?: (event: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
  onProgress?: () => void;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({
  src,
  className = "",
  muted = true,
  loop = true,
  playsInline = true,
  preload = "none",
  controlsList = "nodownload",
  disablePictureInPicture = false,
  onCanPlay,
  onLoadStart,
  onLoadedData,
  onError,
  onProgress,
}, ref) => {
  return (
    <video
      ref={ref}
      src={src}
      className={className}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={preload}
      controlsList={controlsList}
      disablePictureInPicture={disablePictureInPicture}
      onCanPlay={onCanPlay}
      onLoadStart={onLoadStart}
      onLoadedData={onLoadedData}
      onError={onError}
      onProgress={onProgress}
    >
      Your browser does not support the video tag.
    </video>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
