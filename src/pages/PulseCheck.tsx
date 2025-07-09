import React, { useState, useEffect } from "react";
import { PulseCheckCard, pulseCheckCards } from "@/data/pulseCheckCards";
import SwipeCard from "@/components/pulse-check/SwipeCard";
import CategoryProgress from "@/components/pulse-check/CategoryProgress";
import ConfidenceLevelBar from "@/components/pulse-check/ConfidenceLevelBar";
import RadarChart from "@/components/pulse-check/RadarChart";
import PulseCheckActions from "@/components/pulse-check/PulseCheckActions";
import Header from "@/components/Header";
import {
  getInitialCategoryCards,
  getRemainingShuffledCards,
  getCategoryCompletion,
} from "@/utils/cardRandomization";
import { useAIResults } from "@/hooks/useAIResults";

const PulseCheck = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: "keep" | "pass" }>(
    {}
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [cardSequence, setCardSequence] = useState<PulseCheckCard[]>([]);
  const [showResultsOption, setShowResultsOption] = useState(false);

  const { aiResults, isLoading: aiLoading, generateAIResults } = useAIResults();

  useEffect(() => {
    const initialFourCategoryCards = getInitialCategoryCards(pulseCheckCards);
    const remainingShuffled = getRemainingShuffledCards(
      pulseCheckCards,
      initialFourCategoryCards
    );
    const sequence = [...initialFourCategoryCards, ...remainingShuffled];
    setCardSequence(sequence);
  }, []);

  useEffect(() => {
    if (Object.keys(answers).length >= 4) {
      setShowResultsOption(true);
    } else {
      setShowResultsOption(false);
    }

    if (currentCardIndex === cardSequence.length && cardSequence.length > 0) {
      handleShowResults();
    }
  }, [answers, cardSequence, currentCardIndex]);

  const handleSwipe = (cardId: number, decision: "keep" | "pass") => {
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
    setShowResultsOption(false);

    const initialFourCategoryCards = getInitialCategoryCards(pulseCheckCards);
    const remainingShuffled = getRemainingShuffledCards(
      pulseCheckCards,
      initialFourCategoryCards
    );
    const sequence = [...initialFourCategoryCards, ...remainingShuffled];
    setCardSequence(sequence);
  };

  const visibleCards = cardSequence.slice(
    currentCardIndex,
    currentCardIndex + 3
  );

  const categoryCompletionData = getCategoryCompletion(answers, cardSequence);
  const categoryProgress = [
    {
      name: "Career",
      completed: categoryCompletionData.Career.completed,
      total: categoryCompletionData.Career.total,
    },
    {
      name: "Finances",
      completed: categoryCompletionData.Finances.completed,
      total: categoryCompletionData.Finances.total,
    },
    {
      name: "Health",
      completed: categoryCompletionData.Health.completed,
      total: categoryCompletionData.Health.total,
    },
    {
      name: "Connections",
      completed: categoryCompletionData.Connections.completed,
      total: categoryCompletionData.Connections.total,
    },
  ];

  const totalAnsweredQuestions = Object.keys(answers).length;
  const totalPossibleQuestions = pulseCheckCards.length;
  const confidenceLevelValue =
    totalPossibleQuestions > 0
      ? (totalAnsweredQuestions / totalPossibleQuestions) * 100
      : 0;

  return (
    <div className="min-h-screen bg-[#16161a] text-white overflow-hidden flex flex-col">
      <Header />

      {/* Results Page */}
      {isCompleted && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-6xl mx-auto text-center">
            {/* Reverted font size to text-3xl md:text-5xl for results title */}
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Pulse Check Results
            </h1>

            {aiLoading && (
              <div className="mb-8">
                {" "}
                {/* Reverted margin to mb-8 */}
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>{" "}
                {/* Reverted size and margin */}
                <p className="text-gray-300">
                  Analyzing your responses with AI...
                </p>{" "}
                {/* Reverted font size */}
              </div>
            )}

            {aiResults && !aiLoading && (
              <>
                <div className="mb-6 md:mb-8">
                  {" "}
                  {/* Reverted margin */}
                  <RadarChart data={aiResults} insights={aiResults.insights} />
                </div>

                <div className="flex justify-center mb-6 md:mb-8">
                  {" "}
                  {/* Reverted margin */}
                  <PulseCheckActions data={aiResults} />
                </div>
              </>
            )}

            <button
              onClick={handleRetake}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold transition-colors text-sm md:text-base" // Reverted padding and font size
            >
              Take Again
            </button>
          </div>
        </div>
      )}

      {/* Pulse Check Interface */}
      {!isCompleted && cardSequence.length > 0 && (
        <div className="flex-1 flex flex-col">
          {/* Header section with title and description */}
          <div className="text-center py-4 md:py-8 px-4">
            {" "}
            {/* Reverted vertical padding */}
            {/* Reverted font size to text-2xl md:text-4xl for main title */}
            <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Life Path Pulse Check
            </h1>
            {/* Reverted font size to text-sm md:text-lg for description */}
            <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto">
              Swipe through insights about your life across four key areas. Keep
              what resonates, pass what doesn't.
            </p>
          </div>

          {/* Category-specific progress circles */}
          <CategoryProgress categories={categoryProgress} />

          {/* Confidence Level Bar */}
          <ConfidenceLevelBar value={confidenceLevelValue} />

          {/* "See Results Now" option - conditional display */}
          {showResultsOption && !isCompleted && (
            <div className="text-center mb-4">
              {" "}
              {/* Reverted margin */}
              <button
                onClick={handleShowResults}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-base" // Reverted padding and font size
              >
                See Results Now
              </button>
              <p className="text-gray-400 text-sm mt-2">
                {" "}
                {/* Reverted font size and margin */}
                You can see your results now, or continue swiping.
              </p>
            </div>
          )}

          {/* Main card swiping area */}
          <div className="flex-1 flex items-center justify-center px-4 md:px-8 pb-4 md:pb-8">
            <div className="relative w-full max-w-md h-[360px] md:h-96 lg:h-[600px]">
              {" "}
              {/* Retained h-[360px] for mobile card container */}
              {/* Render visible SwipeCards */}
              {visibleCards.map((card, index) => (
                <SwipeCard
                  key={card.id}
                  card={card}
                  onSwipe={handleSwipe}
                  isActive={index === 0}
                  zIndex={visibleCards.length - index}
                />
              ))}
              {/* Message when all cards are swiped */}
              {visibleCards.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-semibold mb-4">All done!</p>{" "}
                    {/* Reverted font size and margin */}
                    <button
                      onClick={handleShowResults}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-base" // Reverted padding and font size
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
