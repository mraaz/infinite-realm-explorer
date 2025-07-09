import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import {
  PulseCheckCard,
  categoryColors,
  categoryIconPaths,
  keepMessages,
  passMessages,
} from "@/data/pulseCheckCards";

interface SwipeCardProps {
  card: PulseCheckCard;
  onSwipe: (cardId: number, decision: "keep" | "pass") => void;
  isActive: boolean;
  zIndex: number;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  card,
  onSwipe,
  isActive,
  zIndex,
}) => {
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [passMessage] = useState(
    () => passMessages[Math.floor(Math.random() * passMessages.length)]
  );
  const [keepMessage] = useState(
    () => keepMessages[Math.floor(Math.random() * keepMessages.length)]
  );

  const categoryColor =
    categoryColors[card.category as keyof typeof categoryColors];
  const iconPath =
    categoryIconPaths[card.category as keyof typeof categoryIconPaths];

  const [hasFlippedInitial, setHasFlippedInitial] = useState(false);

  useEffect(() => {
    if (isActive && !hasFlippedInitial) {
      setHasFlippedInitial(true);
    }
  }, [isActive, hasFlippedInitial]);

  const handleButtonClick = (decision: "keep" | "pass") => {
    if (!isActive) return;
    handleSwipeAction(decision);
  };

  const handleSwipeAction = (decision: "keep" | "pass") => {
    setIsAnimating(true);
    setSwipeDirection(decision === "keep" ? "right" : "left");
    setSwipeOffset(decision === "keep" ? 300 : -300);

    setTimeout(() => {
      onSwipe(card.id, decision);
    }, 300);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isActive && !isAnimating) {
        handleSwipeAction("pass");
      }
    },
    onSwipedRight: () => {
      if (isActive && !isAnimating) {
        handleSwipeAction("keep");
      }
    },
    onSwiping: (eventData) => {
      if (isActive && !isAnimating) {
        const { deltaX } = eventData;
        setSwipeOffset(deltaX);
        if (Math.abs(deltaX) > 50) {
          setSwipeDirection(deltaX > 0 ? "right" : "left");
        } else {
          setSwipeDirection(null);
        }
      }
    },
    onSwipeStart: () => {
      if (isActive) {
        setSwipeDirection(null);
        setSwipeOffset(0);
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 10,
  });

  const cardTransform = isAnimating
    ? `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.1}deg)`
    : `translateX(${Math.min(Math.max(swipeOffset, -150), 150)}px) rotate(${
        Math.min(Math.max(swipeOffset, -150), 150) * 0.1
      }deg)`;

  const cardOpacity = isAnimating
    ? Math.max(0, 1 - Math.abs(swipeOffset) / 300)
    : Math.max(0.7, 1 - Math.abs(swipeOffset) / 200);

  return (
    <div
      {...swipeHandlers}
      className={`absolute inset-0 w-full h-full ${
        isActive ? "cursor-pointer" : "pointer-events-none"
      } ${
        isAnimating
          ? "transition-all duration-300 ease-out"
          : "transition-transform duration-200"
      }`}
      style={{
        zIndex,
        transform: cardTransform,
        opacity: cardOpacity,
      }}
    >
      <div className="flip-card w-full h-full">
        <div
          className={`flip-card-inner ${hasFlippedInitial ? "flipped" : ""}`}
        >
          {/* Front of card (hidden, but structure maintained for flip animation) */}
          <div className="flip-card-front">
            <div
              className={`w-full h-full rounded-2xl border ${categoryColor.border} bg-gradient-to-br ${categoryColor.gradient} backdrop-blur-sm p-4 md:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden`} // Reverted initial p to original
            >
              {/* This content is technically not visible due to immediate flip, keeping original size for consistency if ever visible */}
              <div
                className={`absolute top-3 left-3 md:top-4 md:left-4 flex items-center gap-2 md:gap-3 ${categoryColor.bg} px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg border border-white/20`}
              >
                <img
                  src={iconPath}
                  alt={card.category}
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                <span
                  className={`text-sm md:text-lg font-bold ${categoryColor.text}`}
                >
                  {card.category}
                </span>
              </div>
            </div>
          </div>

          {/* Back of card (the main visible content) */}
          <div className="flip-card-back">
            <div
              className={`w-full h-full rounded-2xl border ${categoryColor.border} bg-gradient-to-br ${categoryColor.gradient} backdrop-blur-sm p-4 md:p-6 flex flex-col justify-between relative overflow-hidden`}
            >
              {" "}
              {/* Reverted padding here as well for overall space */}
              {/* Category indicator (top-left badge) */}
              <div
                className={`flex items-center gap-2 md:gap-3 ${categoryColor.bg} px-3 py-1.5 md:px-4 md:py-2 rounded-full w-fit shadow-lg border border-white/20`}
              >
                {" "}
                {/* Reverted to original padding and gaps */}
                <img
                  src={iconPath}
                  alt={card.category}
                  className="w-5 h-5 md:w-6 md:h-6"
                />{" "}
                {/* Reverted icon size */}
                <span
                  className={`text-sm md:text-lg font-bold ${categoryColor.text}`}
                >
                  {card.category}
                </span>{" "}
                {/* Reverted text size */}
              </div>
              {/* Card text (the quote) */}
              <div className="flex-1 flex items-center justify-center px-4 py-4 md:py-8">
                {" "}
                {/* Reverted padding */}
                <p className="text-base md:text-xl text-white font-medium leading-relaxed text-center">
                  {" "}
                  {/* Reverted font size for responsiveness but added md:text-xl */}
                  "{card.text}"
                </p>
              </div>
              {/* Action buttons */}
              <div className="flex justify-between items-center gap-3 md:gap-4">
                {" "}
                {/* Reverted gap */}
                <button
                  onClick={() => handleButtonClick("pass")}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 text-sm md:text-base" // Reverted padding and font size
                >
                  {passMessage}
                </button>
                <button
                  onClick={() => handleButtonClick("keep")}
                  className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 text-sm md:text-base" // Reverted padding and font size
                >
                  {keepMessage}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe indicators */}
      {swipeDirection && (
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none`}
        >
          <div
            className={`text-4xl md:text-6xl font-bold ${
              swipeDirection === "right" ? "text-purple-400" : "text-red-400"
            } opacity-70`}
          >
            {swipeDirection === "right" ? "KEEP" : "PASS"}
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeCard;
