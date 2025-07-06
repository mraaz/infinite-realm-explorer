import React, { useState, useRef, useEffect } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const categoryColor = categoryColors[card.category as keyof typeof categoryColors];
  const iconPath = categoryIconPaths[card.category as keyof typeof categoryIconPaths];

  const getRandomMessage = (messages: string[]) => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleReveal = () => {
    if (!isActive) return;
    setIsRevealed(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isRevealed || !isActive) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isActive) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });

    // Determine swipe direction
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || !isActive) return;
    setIsDragging(false);

    // Check if swipe threshold is met
    if (Math.abs(dragOffset.x) > 100) {
      const decision = dragOffset.x > 0 ? 'keep' : 'pass';
      onSwipe(card.id, decision);
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }
  };

  const handleButtonClick = (decision: 'keep' | 'pass') => {
    if (!isRevealed || !isActive) return;
    onSwipe(card.id, decision);
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isRevealed || !isActive) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isActive) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });

    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isActive) return;
    setIsDragging(false);

    if (Math.abs(dragOffset.x) > 100) {
      const decision = dragOffset.x > 0 ? 'keep' : 'pass';
      onSwipe(card.id, decision);
    } else {
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }
  };

  const cardTransform = `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`;
  const cardOpacity = Math.max(0.3, 1 - Math.abs(dragOffset.x) / 300);

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 w-full h-full transition-all duration-300 ${
        isActive ? 'cursor-pointer' : 'pointer-events-none'
      }`}
      style={{
        zIndex,
        transform: cardTransform,
        opacity: cardOpacity,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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