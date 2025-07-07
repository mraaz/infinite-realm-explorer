
import React, { useState, useEffect } from 'react';
import { PulseCheckCard, pulseCheckCards } from '@/data/pulseCheckCards';
import SwipeCard from '@/components/pulse-check/SwipeCard';
import CategoryProgress from '@/components/pulse-check/CategoryProgress';
import OverallProgressBar from '@/components/OverallProgressBar';
import RadarChart from '@/components/pulse-check/RadarChart';
import PulseCheckActions from '@/components/pulse-check/PulseCheckActions';
import { 
  getInitialPositiveCards, 
  getRemainingShuffledCards, 
  canShowResults,
  getCategoryCompletion 
} from '@/utils/cardRandomization';
import { useAIResults } from '@/hooks/useAIResults';

const PulseCheck = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: 'keep' | 'pass' }>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [cardSequence, setCardSequence] = useState<PulseCheckCard[]>([]);
  const [canSeeResults, setCanSeeResults] = useState(false);
  const [showResultsOption, setShowResultsOption] = useState(false);
  
  const { aiResults, isLoading: aiLoading, generateAIResults } = useAIResults();

  // Initialize card sequence on component mount
  useEffect(() => {
    const initialPositiveCards = getInitialPositiveCards(pulseCheckCards);
    const remainingCards = getRemainingShuffledCards(pulseCheckCards, initialPositiveCards);
    const sequence = [...initialPositiveCards, ...remainingCards];
    setCardSequence(sequence);
  }, []);

  // Check if results can be shown after each answer
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const canShow = canShowResults(answers, cardSequence);
      setCanSeeResults(canShow);
      
      // Show results option after minimum requirements are met and user has answered at least 8 questions
      if (canShow && Object.keys(answers).length >= 8) {
        setShowResultsOption(true);
      }
    }
  }, [answers, cardSequence]);

  const handleSwipe = (cardId: number, decision: 'keep' | 'pass') => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [cardId]: decision }));
    setCurrentCardIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      if (newIndex === cardSequence.length) {
        handleShowResults();
      }
      return newIndex;
    });
  };

  const handleShowResults = async () => {
    setIsCompleted(true);
    if (Object.keys(answers).length > 0) {
      await generateAIResults(answers, cardSequence);
    }
  };

  const handleRetake = () => {
    setIsCompleted(false);
    setCurrentCardIndex(0);
    setAnswers({});
    setCanSeeResults(false);
    setShowResultsOption(false);
    
    // Re-randomize cards
    const initialPositiveCards = getInitialPositiveCards(pulseCheckCards);
    const remainingCards = getRemainingShuffledCards(pulseCheckCards, initialPositiveCards);
    const sequence = [...initialPositiveCards, ...remainingCards];
    setCardSequence(sequence);
  };

  const visibleCards = cardSequence.slice(currentCardIndex, currentCardIndex + 3);

  const categoryCompletion = getCategoryCompletion(answers, cardSequence);
  const categoryProgress = [
    {
      name: 'Career',
      completed: Object.keys(answers).filter(
        (key) =>
          answers[Number(key)] &&
          cardSequence.find((card) => card.id === Number(key))?.category === 'Career'
      ).length,
      total: cardSequence.filter((card) => card.category === 'Career').length,
    },
    {
      name: 'Finances',
      completed: Object.keys(answers).filter(
        (key) =>
          answers[Number(key)] &&
          cardSequence.find((card) => card.id === Number(key))?.category === 'Finances'
      ).length,
      total: cardSequence.filter((card) => card.category === 'Finances').length,
    },
    {
      name: 'Health',
      completed: Object.keys(answers).filter(
        (key) =>
          answers[Number(key)] &&
          cardSequence.find((card) => card.id === Number(key))?.category === 'Health'
      ).length,
      total: cardSequence.filter((card) => card.category === 'Health').length,
    },
    {
      name: 'Connections',
      completed: Object.keys(answers).filter(
        (key) =>
          answers[Number(key)] &&
          cardSequence.find((card) => card.id === Number(key))?.category === 'Connections'
      ).length,
      total: cardSequence.filter((card) => card.category === 'Connections').length,
    },
  ];

  return (
    <div className="min-h-screen bg-[#16161a] text-white overflow-hidden">
      {/* Results Page */}
      {isCompleted && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-6xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Pulse Check Results
            </h1>
            
            {aiLoading && (
              <div className="mb-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                <p className="text-gray-300">Analyzing your responses with AI...</p>
              </div>
            )}
            
            {aiResults && !aiLoading && (
              <>
                <div className="mb-6 md:mb-8">
                  <RadarChart data={aiResults} insights={aiResults.insights} />
                </div>
                
                <div className="flex justify-center mb-6 md:mb-8">
                  <PulseCheckActions data={aiResults} />
                </div>
              </>
            )}
            
            <button
              onClick={handleRetake}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold transition-colors text-sm md:text-base"
            >
              Take Again
            </button>
          </div>
        </div>
      )}

      {/* Pulse Check Interface */}
      {!isCompleted && cardSequence.length > 0 && (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="text-center py-4 md:py-8 px-4">
            <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Life Path Pulse Check
            </h1>
            <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto">
              Swipe through insights about your life across four key areas. Keep what resonates, pass what doesn't.
            </p>
          </div>

          {/* Category Progress */}
          <CategoryProgress categories={categoryProgress} />

          {/* Overall Progress */}
          <OverallProgressBar value={(currentCardIndex / cardSequence.length) * 100} />

          {/* Results Option */}
          {showResultsOption && !isCompleted && (
            <div className="text-center mb-4">
              <button
                onClick={handleShowResults}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                See Results Now
              </button>
              <p className="text-gray-400 text-sm mt-2">
                {canSeeResults ? "Ready to see your results, or continue swiping" : "Answer at least one question per category to see results"}
              </p>
            </div>
          )}

          {/* Card Container */}
          <div className="flex-1 flex items-center justify-center px-4 md:px-8 pb-4 md:pb-8">
            <div className="relative w-full max-w-md h-80 md:h-96 lg:h-[600px]">
              {/* Card stack */}
              {visibleCards.map((card, index) => (
                <SwipeCard
                  key={card.id}
                  card={card}
                  onSwipe={handleSwipe}
                  isActive={index === 0}
                  zIndex={visibleCards.length - index}
                />
              ))}
              
              {visibleCards.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-semibold mb-4">All done!</p>
                    <button
                      onClick={handleShowResults}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                      See Your Results
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PulseCheck;
