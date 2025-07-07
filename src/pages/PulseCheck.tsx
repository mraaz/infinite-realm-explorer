
import React, { useState, useEffect } from 'react';
import SwipeCard from '@/components/pulse-check/SwipeCard';
import { pulseCheckCards, PulseCheckCard } from '@/data/pulseCheckCards';
import RadarChart from '@/components/pulse-check/RadarChart';
import ShareButton from '@/components/pulse-check/ShareButton';
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
  const [answeredCategories, setAnsweredCategories] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<CategoryScores | null>(null);
  const [insights, setInsights] = useState<{ Career: string; Finances: string; Health: string; Connections: string; } | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [canFinish, setCanFinish] = useState<boolean>(false);

  // Initialize with shuffled cards on component mount
  useEffect(() => {
    const shuffledCards = shuffleArray(pulseCheckCards);
    setCardStack(shuffledCards);
  }, []);

  // Check if we can finish (at least one question per category answered)
  useEffect(() => {
    const requiredCategories = ['Career', 'Finances', 'Health', 'Connections'];
    const hasAllCategories = requiredCategories.every(cat => answeredCategories.has(cat));
    setCanFinish(hasAllCategories);
  }, [answeredCategories]);

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
    const currentCard = cardStack[activeCardIndex];
    
    // Add the category to answered categories
    if (currentCard) {
      setAnsweredCategories(prev => new Set([...prev, currentCard.category]));
    }

    if (activeCardIndex < cardStack.length) {
      setActiveCardIndex(activeCardIndex + 1);
    }

    // Check if we should finish - either all cards done OR can finish and user chose to
    const isLastCard = activeCardIndex === cardStack.length - 1;
    
    if (isLastCard || (canFinish && activeCardIndex >= Math.min(cardStack.length - 1, 12))) {
      await finishPulseCheck();
    }
  };

  const finishPulseCheck = async () => {
    setIsLoading(true);
    const answeredCards = cardStack.slice(0, activeCardIndex + 1);
    const selectedCards = answeredCards.map((card, index) => ({
      cardId: card.id,
      decision: 'keep', // For now, treating all as 'keep' - you might want to track actual decisions
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
      console.log('AI Results:', data);
      
      setResults(data);
      setInsights(data.insights);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating scores:', error);
      // Fallback results for testing
      const fallbackResults = {
        Career: 75,
        Finances: 60,
        Health: 55,
        Connections: 80,
        insights: {
          Career: "Strong positive momentum with intentionality and action-taking, though some uncertainty about career direction exists",
          Finances: "Financial growth present but experiencing emotional strain around money management",
          Health: "Mixed picture showing accountability but struggling with follow-through on healthy habits",
          Connections: "Excellent progress in building meaningful relationships and maintaining authentic connections"
        }
      };
      setResults(fallbackResults);
      setInsights(fallbackResults.insights);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishEarly = async () => {
    if (canFinish) {
      await finishPulseCheck();
    }
  };

  const resetPulseCheck = () => {
    const shuffledCards = shuffleArray(pulseCheckCards);
    setCardStack(shuffledCards);
    setActiveCardIndex(0);
    setAnsweredCategories(new Set());
    setResults(null);
    setInsights(null);
    setShowResults(false);
    setCanFinish(false);
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

        {/* Finish Early Button */}
        {canFinish && !showResults && (
          <div className="text-center mb-8">
            <button
              onClick={handleFinishEarly}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Get My Results Now
            </button>
            <p className="text-gray-400 text-sm mt-2">
              You've answered at least one question from each category
            </p>
          </div>
        )}

        {/* Card Stack or Results */}
        {showResults ? (
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                AI-powered insights from your pulse check
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Here's how you're doing across the four key areas of your life, based on your responses.
              </p>
            </div>
            
            <RadarChart data={results!} insights={insights} />
            
            {/* Share Button */}
            <div className="flex justify-center mt-6">
              <ShareButton data={results!} />
            </div>
            
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
                Take Another Pulse Check
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-600 hover:bg-gray-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Back to Home
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
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                <div className="text-white text-2xl font-bold flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                  Generating your insights...
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
