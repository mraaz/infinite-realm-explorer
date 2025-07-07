
import React, { useState, useEffect } from 'react';
import SwipeCard from '@/components/pulse-check/SwipeCard';
import { pulseCheckCards, PulseCheckCard } from '@/data/pulseCheckCards';
import RadarChart from '@/components/pulse-check/RadarChart';
import OverallProgressBar from '@/components/OverallProgressBar';
import CategoryProgress from '@/components/pulse-check/CategoryProgress';

interface CategoryScores {
  Career: number;
  Finances: number;
  Health: number;
  Connections: number;
}

// Fisher-Yates shuffle algorithm for randomizing array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const PulseCheck: React.FC = () => {
  const [cardStack, setCardStack] = useState<PulseCheckCard[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [results, setResults] = useState<CategoryScores | null>(null);
  const [insights, setInsights] = useState<{ Career: string; Finances: string; Health: string; Connections: string; } | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize with shuffled cards on component mount
  useEffect(() => {
    const shuffledCards = shuffleArray(pulseCheckCards);
    setCardStack(shuffledCards);
  }, []);

  // Calculate progress
  const totalCards = cardStack.length;
  const cardsLeft = totalCards - activeCardIndex;
  const progress = totalCards > 0 ? ((totalCards - cardsLeft) / totalCards) * 100 : 0;

  // Calculate category progress using the original pulseCheckCards for totals
  const categoryTotals = {
    Career: pulseCheckCards.filter(card => card.category === 'Career').length,
    Finances: pulseCheckCards.filter(card => card.category === 'Finances').length,
    Health: pulseCheckCards.filter(card => card.category === 'Health').length,
    Connections: pulseCheckCards.filter(card => card.category === 'Connections').length
  };

  const categoryProgress = {
    Career: cardStack.filter((card, index) => index < activeCardIndex && card.category === 'Career').length,
    Finances: cardStack.filter((card, index) => index < activeCardIndex && card.category === 'Finances').length,
    Health: cardStack.filter((card, index) => index < activeCardIndex && card.category === 'Health').length,
    Connections: cardStack.filter((card, index) => index < activeCardIndex && card.category === 'Connections').length
  };

  const handleSwipe = async (cardId: number, decision: 'keep' | 'pass') => {
    if (activeCardIndex < cardStack.length) {
      setActiveCardIndex(activeCardIndex + 1);
    }

    if (activeCardIndex === cardStack.length - 1) {
      setIsLoading(true);
      const selectedCards = cardStack.slice(0, activeCardIndex + 1).map((card, index) => ({
        cardId: card.id,
        decision: index < activeCardIndex ? (decision === 'keep' ? 'keep' : 'pass') : decision,
        card_data: {
          category: card.category,
          tone: card.tone,
          text: card.text
        }
      }));

      try {
        const response = await fetch('/api/generate-scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ results: selectedCards }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setResults(data);
        setInsights(data.insights);
        setShowResults(true);
      } catch (error) {
        console.error('Error generating scores:', error);
        // Handle error appropriately
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetPulseCheck = () => {
    const shuffledCards = shuffleArray(pulseCheckCards);
    setCardStack(shuffledCards);
    setActiveCardIndex(0);
    setResults(null);
    setInsights(null);
    setShowResults(false);
  };

  // Don't render until cards are shuffled
  if (cardStack.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Life Pulse Check
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A quick exploration of where you stand in the four key areas of life
          </p>
        </div>

        {/* Progress Bar */}
        <OverallProgressBar value={progress} />

        {/* Category Progress */}
        <CategoryProgress 
          categories={[
            { name: 'Career', completed: categoryProgress.Career, total: categoryTotals.Career },
            { name: 'Finances', completed: categoryProgress.Finances, total: categoryTotals.Finances },
            { name: 'Health', completed: categoryProgress.Health, total: categoryTotals.Health },
            { name: 'Connections', completed: categoryProgress.Connections, total: categoryTotals.Connections }
          ]}
        />

        {/* Card Stack or Results */}
        {showResults ? (
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Your Life Balance Overview
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Here's how you're doing across the four key areas of your life, based on your responses.
              </p>
            </div>
            
            <RadarChart data={results!} insights={insights} />
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() => window.location.href = '/onboarding-questionnaire'}
                className="bg-gradient-cta hover:opacity-90 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Get your Life Snapshot
              </button>
              <button
                onClick={resetPulseCheck}
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Take Again
              </button>
            </div>
          </div>
        ) : (
          <div className="relative h-[600px] w-full max-w-2xl mx-auto">
            {cardStack.slice(activeCardIndex, activeCardIndex + 3).map((card, index) => (
              <SwipeCard
                key={card.id}
                card={card}
                onSwipe={handleSwipe}
                isActive={index === 0}
                zIndex={3 - index}
              />
            ))}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-2xl font-bold">
                  Loading...
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PulseCheck;
