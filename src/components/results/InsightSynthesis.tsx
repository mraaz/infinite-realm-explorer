
import React, { useState, useRef, useEffect } from 'react';
import { Insight } from '@/types/insights';
import { useInsightCards } from '@/hooks/useInsightCards';
import InsightCard from './insights/InsightCard';
import useOnScreen from '@/hooks/useOnScreen';

interface InsightSynthesisProps {
  insights: Insight[];
}

const InsightSynthesis = ({ insights }: InsightSynthesisProps) => {
  const { flippedCards, handleCardClick } = useInsightCards(insights.length);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Create a ref to attach to the section we want to observe
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // The hook returns `true` when the ref is on screen
  // We'll set the threshold to 0.5, meaning it triggers when 50% of the section is visible
  const isVisible = useOnScreen(sectionRef, { threshold: 0.5 });

  // This effect will now run whenever `isVisible` changes
  useEffect(() => {
    // If the section is visible AND we haven't animated yet...
    if (isVisible && !hasAnimated) {
      // Trigger the animation by setting the hasAnimated flag
      setHasAnimated(true);
    }
  }, [isVisible, hasAnimated]);

  return (
    <section ref={sectionRef} className="mb-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Insight Synthesis</h2>
      <p className="text-lg text-gray-600 text-center mb-8">Patterns spotted from your responses</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <InsightCard
            key={index}
            insight={insight}
            isFlipped={flippedCards[index]}
            onClick={() => handleCardClick(index)}
            showPeekAnimation={hasAnimated}
            isFirstCard={index === 0}
            animationDelay={index * 200}
          />
        ))}
      </div>
    </section>
  );
};

export default InsightSynthesis;
