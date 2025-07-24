// src/components/VideoCenterpiece.tsx

import React, { useState, useEffect, useRef } from "react";

const VideoCenterpiece = () => {
  // --- This part for selecting video quality remains the same ---
  const videoSD =
    "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/HomePageVideoSD.mp4";
  const videoMobile =
    "https://abcojhdnhxatbmdmyiav.supabase.co/storage/v1/object/public/video/HomePageVideoMobile.mp4";
  const [videoSrc, setVideoSrc] = useState(videoSD);

  useEffect(() => {
    const connection = (navigator as any).connection;
    if (connection) {
      const isSlowConnection =
        connection.saveData ||
        ["slow-2g", "2g"].includes(connection.effectiveType);
      if (isSlowConnection) {
        setVideoSrc(videoMobile);
      }
    }
  }, []);

  // --- New logic for pausing the video when it's not visible ---
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Play the video when it's visible.
          // The .catch() prevents errors if the browser blocks autoplay.
          video
            .play()
            .catch((error) => console.error("Video play failed:", error));
        } else {
          // Pause the video when it's not visible.
          video.pause();
        }
      },
      {
        // This means the event will trigger when 50% of the video is visible.
        threshold: 0.5,
      }
    );

    observer.observe(video);

    // Cleanup function to stop observing when the component is removed.
    return () => {
      if (video) {
        observer.unobserve(video);
      }
    };
  }, [videoSrc]); // This effect depends on videoSrc to re-attach the observer if the video reloads.

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl">
      <video
        ref={videoRef} // Attach the ref to the video element.
        className="w-full h-full"
        key={videoSrc}
        src={videoSrc}
        muted
        playsInline
        controls
        loop // Loop is useful again with this play/pause behavior.
        aria-label="Promotional video showing the application's features."
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoCenterpiece;
