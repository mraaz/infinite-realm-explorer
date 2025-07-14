
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

  // Debug video element creation
  console.log('🎬 [VideoPlayer] Component rendered:', {
    src,
    className,
    muted,
    loop,
    playsInline,
    preload,
    controlsList,
    disablePictureInPicture,
    hasCallbacks: {
      onCanPlay: !!onCanPlay,
      onLoadStart: !!onLoadStart,
      onLoadedData: !!onLoadedData,
      onError: !!onError,
      onProgress: !!onProgress
    },
    timestamp: new Date().toISOString()
  });

  const handleCanPlay = () => {
    console.log('✅ [VideoPlayer] Can Play event fired:', { src });
    if (onCanPlay) onCanPlay();
  };

  const handleLoadStart = () => {
    console.log('⏳ [VideoPlayer] Load Start event fired:', { src });
    if (onLoadStart) onLoadStart();
  };

  const handleLoadedData = () => {
    console.log('📊 [VideoPlayer] Loaded Data event fired:', { src });
    if (onLoadedData) onLoadedData();
  };

  const handleError = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = event.currentTarget;
    const error = video.error;
    console.error('❌ [VideoPlayer] Error event fired:', {
      src,
      error: error ? {
        code: error.code,
        message: error.message,
        MEDIA_ERR_ABORTED: error.MEDIA_ERR_ABORTED,
        MEDIA_ERR_NETWORK: error.MEDIA_ERR_NETWORK,
        MEDIA_ERR_DECODE: error.MEDIA_ERR_DECODE,
        MEDIA_ERR_SRC_NOT_SUPPORTED: error.MEDIA_ERR_SRC_NOT_SUPPORTED
      } : 'No error object',
      videoState: {
        readyState: video.readyState,
        networkState: video.networkState,
        currentSrc: video.currentSrc,
        duration: video.duration,
        buffered: video.buffered.length
      }
    });
    if (onError) onError(event);
  };

  const handleProgress = () => {
    if (ref && typeof ref === 'object' && ref.current) {
      const video = ref.current;
      console.log('📈 [VideoPlayer] Progress event fired:', {
        src,
        buffered: video.buffered.length > 0 ? {
          start: video.buffered.start(0),
          end: video.buffered.end(video.buffered.length - 1),
          duration: video.duration,
          percentage: video.duration ? (video.buffered.end(video.buffered.length - 1) / video.duration * 100).toFixed(1) + '%' : 'unknown'
        } : 'No buffered ranges'
      });
    }
    if (onProgress) onProgress();
  };

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
      onCanPlay={handleCanPlay}
      onLoadStart={handleLoadStart}
      onLoadedData={handleLoadedData}
      onError={handleError}
      onProgress={handleProgress}
    >
      Your browser does not support the video tag.
    </video>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
