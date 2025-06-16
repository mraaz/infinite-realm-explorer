
import { useState } from 'react';

export const useInsightCards = (insightsCount: number) => {
  const [flippedCards, setFlippedCards] = useState<boolean[]>(
    new Array(insightsCount).fill(false)
  );

  const handleCardClick = (index: number) => {
    setFlippedCards(prev => 
      prev.map((flipped, i) => i === index ? !flipped : flipped)
    );
  };

  return {
    flippedCards,
    handleCardClick,
  };
};
