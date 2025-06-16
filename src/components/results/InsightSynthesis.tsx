
import React, { useEffect, useState } from 'react';
import { Insight } from '@/types/insights';
import { useInsightCards } from '@/hooks/useInsightCards';
import InsightCard from './insights/InsightCard';

interface InsightSynthesisProps {
  insights: Insight[];
}

const InsightSynthesis = ({ insights }: InsightSynthesisProps) => {
  const { flippedCards, handleCardClick } = useInsightCards(insights.length);
  const [peekAnimationIndex, setPeekAnimationIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPeekAnimationIndex(-1);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Insight Synthesis</h2>
      <p className="text-lg text-gray-600 text-center mb-8">Patterns spotted from your responses</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <InsightCard
            key={index}
            insight={insight}
            isFlipped={flippedCards[index]}
            onClick={() => handleCardClick(index)}
            showPeekAnimation={index === peekAnimationIndex}
          />
        ))}
      </div>
    </section>
  );
};

export default InsightSynthesis;
