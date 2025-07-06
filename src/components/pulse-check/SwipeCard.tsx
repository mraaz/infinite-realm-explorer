import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { PulseCheckCard, categoryColors, categoryIconPaths, keepMessages, passMessages } from '@/data/pulseCheckCards';
import { Eye } from 'lucide-react';

interface SwipeCardProps {
  card: PulseCheckCard;
  onSwipe: (cardId: number, decision: 'keep' | 'pass') => void;
  isActive: boolean;
  zIndex: number;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ card, onSwipe, isActive, zIndex }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const categoryColor = categoryColors[card.category as keyof typeof categoryColors];
  const iconPath = categoryIconPaths[card.category as keyof typeof categoryIconPaths];

  const getRandomMessage = (messages: string[]) => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleReveal = () => {
    if (!isActive) return;
    setIsRevealed(true);
  };

  const handleButtonClick = (decision: 'keep' | 'pass') => {
    if (!isRevealed || !isActive) return;
    handleSwipeAction(decision);
  };

  const handleSwipeAction = (decision: 'keep' | 'pass') => {
    setIsAnimating(true);
    setSwipeDirection(decision === 'keep' ? 'right' : 'left');
    setSwipeOffset(decision === 'keep' ? 300 : -300);
    
    setTimeout(() => {
      onSwipe(card.id, decision);
    }, 300);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isRevealed && isActive && !isAnimating) {
        handleSwipeAction('pass');
      }
    },
    onSwipedRight: () => {
      if (isRevealed && isActive && !isAnimating) {
        handleSwipeAction('keep');
      }
    },
    onSwiping: (eventData) => {
      if (isRevealed && isActive && !isAnimating) {
        const { deltaX } = eventData;
        setSwipeOffset(deltaX);
        if (Math.abs(deltaX) > 50) {
          setSwipeDirection(deltaX > 0 ? 'right' : 'left');
        } else {
          setSwipeDirection(null);
        }
      }
    },
    onSwipeStart: () => {
      if (isRevealed && isActive) {
        setSwipeDirection(null);
        setSwipeOffset(0);
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 10
  });

  const cardTransform = isAnimating 
    ? `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.1}deg)`
    : `translateX(${Math.min(Math.max(swipeOffset, -150), 150)}px) rotate(${Math.min(Math.max(swipeOffset, -150), 150) * 0.1}deg)`;
  
  const cardOpacity = isAnimating 
    ? Math.max(0, 1 - Math.abs(swipeOffset) / 300)
    : Math.max(0.7, 1 - Math.abs(swipeOffset) / 200);

  return (
    <div
      {...swipeHandlers}
      className={`absolute inset-0 w-full h-full ${
        isActive ? 'cursor-pointer' : 'pointer-events-none'
      } ${isAnimating ? 'transition-all duration-300 ease-out' : 'transition-transform duration-200'}`}
      style={{
        zIndex,
        transform: cardTransform,
        opacity: cardOpacity,
      }}
    >
      <div className="flip-card w-full h-full">
        <div className={`flip-card-inner ${isRevealed ? 'flipped' : ''}`}>
          {/* Front of card */}
          <div className="flip-card-front">
            <div 
              className={`w-full h-full rounded-2xl border ${categoryColor.border} bg-gradient-to-br ${categoryColor.gradient} backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden`}
              onClick={handleReveal}
            >
              {/* Category indicator */}
              <div className={`absolute top-4 left-4 flex items-center gap-2 ${categoryColor.bg} px-3 py-1 rounded-full`}>
                <svg className={`w-4 h-4 ${categoryColor.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
                </svg>
                <span className={`text-sm font-medium ${categoryColor.text}`}>{card.category}</span>
              </div>

              {/* Eye icon */}
              <div className="mb-4">
                <Eye className="w-16 h-16 text-gray-400" />
              </div>

              {/* Text */}
              <h3 className="text-xl font-semibold text-white mb-2">Ready to explore?</h3>
              <p className="text-gray-400 mb-6">Tap to reveal the insight</p>

              {/* Tap to reveal button */}
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Tap to Reveal
              </button>
            </div>
          </div>

          {/* Back of card */}
          <div className="flip-card-back">
            <div className={`w-full h-full rounded-2xl border ${categoryColor.border} bg-gradient-to-br ${categoryColor.gradient} backdrop-blur-sm p-6 flex flex-col justify-between relative overflow-hidden`}>
              {/* Category indicator */}
              <div className={`flex items-center gap-2 ${categoryColor.bg} px-3 py-1 rounded-full w-fit`}>
                <svg className={`w-4 h-4 ${categoryColor.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
                </svg>
                <span className={`text-sm font-medium ${categoryColor.text}`}>{card.category}</span>
              </div>

              {/* Card text */}
              <div className="flex-1 flex items-center justify-center px-4 py-8">
                <p className="text-lg sm:text-xl text-white font-medium leading-relaxed text-center">
                  "{card.text}"
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center gap-4">
                <button
                  onClick={() => handleButtonClick('pass')}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                >
                  {getRandomMessage(passMessages)}
                </button>
                <button
                  onClick={() => handleButtonClick('keep')}
                  className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                >
                  {getRandomMessage(keepMessages)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe indicators */}
      {swipeDirection && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
          <div className={`text-6xl font-bold ${swipeDirection === 'right' ? 'text-purple-400' : 'text-red-400'} opacity-70`}>
            {swipeDirection === 'right' ? 'KEEP' : 'PASS'}
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeCard;