import React, { useState, useEffect } from 'react';
import { PulseCheckCard, pulseCheckCards } from '@/data/pulseCheckCards';
import SwipeCard from '@/components/pulse-check/SwipeCard';
import CategoryProgress from '@/components/pulse-check/CategoryProgress';
import OverallProgressBar from '@/components/OverallProgressBar';
import RadarChart from '@/components/pulse-check/RadarChart';
import ShareButton from '@/components/pulse-check/ShareButton';

interface Results {
  Career: number;
  Finances: number;
  Health: number;
  Connections: number;
}

const PulseCheck = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: 'keep' | 'pass' }>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<Results>({
    Career: 0,
    Finances: 0,
    Health: 0,
    Connections: 0,
  });

  useEffect(() => {
    if (isCompleted) {
      const careerCards = pulseCheckCards.filter((card) => card.category === 'Career');
      const financesCards = pulseCheckCards.filter((card) => card.category === 'Finances');
      const healthCards = pulseCheckCards.filter((card) => card.category === 'Health');
      const connectionsCards = pulseCheckCards.filter((card) => card.category === 'Connections');

      const careerScore = careerCards.reduce((acc, card) => {
        return acc + (answers[card.id] === 'keep' ? 1 : 0);
      }, 0);
      const financesScore = financesCards.reduce((acc, card) => {
        return acc + (answers[card.id] === 'keep' ? 1 : 0);
      }, 0);
      const healthScore = healthCards.reduce((acc, card) => {
        return acc + (answers[card.id] === 'keep' ? 1 : 0);
      }, 0);
      const connectionsScore = connectionsCards.reduce((acc, card) => {
        return acc + (answers[card.id] === 'keep' ? 1 : 0);
      }, 0);

      setResults({
        Career: (careerScore / careerCards.length) * 100,
        Finances: (financesScore / financesCards.length) * 100,
        Health: (healthScore / healthCards.length) * 100,
        Connections: (connectionsScore / connectionsCards.length) * 100,
      });
    }
  }, [isCompleted, answers]);

  const handleSwipe = (cardId: number, decision: 'keep' | 'pass') => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [cardId]: decision }));
    setCurrentCardIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      if (newIndex === pulseCheckCards.length) {
        setIsCompleted(true);
      }
      return newIndex;
    });
  };

  const visibleCards = pulseCheckCards.slice(currentCardIndex, currentCardIndex + 3);

  const categoryProgress = [
    {
      name: 'Career',
      completed: Object.keys(answers).filter(
        (key) =>
          answers[Number(key)] &&
          pulseCheckCards.find((card) => card.id === Number(key))?.category === 'Career'
      ).length,
      total: pulseCheckCards.filter((card) => card.category === 'Career').length,
    },
    {
      name: 'Finances',
      completed: Object.keys(answers).filter(
        (key) =>
          answers[Number(key)] &&
          pulseCheckCards.find((card) => card.id === Number(key))?.category === 'Finances'
      ).length,
      total: pulseCheckCards.filter((card) => card.category === 'Finances').length,
    },
    {
      name: 'Health',
      completed: Object.keys(answers).filter(
        (key) =>
          answers[Number(key)] &&
          pulseCheckCards.find((card) => card.id === Number(key))?.category === 'Health'
      ).length,
      total: pulseCheckCards.filter((card) => card.category === 'Health').length,
    },
    {
      name: 'Connections',
      completed: Object.keys(answers).filter(
        (key) =>
          answers[Number(key)] &&
          pulseCheckCards.find((card) => card.id === Number(key))?.category === 'Connections'
      ).length,
      total: pulseCheckCards.filter((card) => card.category === 'Connections').length,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 text-white overflow-hidden">
      {/* Results Page */}
      {isCompleted && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-6xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Pulse Check Results
            </h1>
            
            <div className="mb-6 md:mb-8">
              <RadarChart data={results} />
            </div>
            
            <div className="flex justify-center mb-6 md:mb-8">
              <ShareButton data={results} />
            </div>
            
            <button
              onClick={() => {
                setIsCompleted(false);
                setCurrentCardIndex(0);
                setAnswers({});
                setResults({ Career: 0, Finances: 0, Health: 0, Connections: 0 });
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold transition-colors text-sm md:text-base"
            >
              Take Again
            </button>
          </div>
        </div>
      )}

      {/* Pulse Check Interface */}
      {!isCompleted && (
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
          <OverallProgressBar value={(currentCardIndex / pulseCheckCards.length) * 100} />

          {/* Card Container - Optimized for mobile */}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PulseCheck;
