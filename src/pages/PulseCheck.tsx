import React, { useState, useEffect } from "react";
import {
  PulseCheckCard,
  pulseCheckCards,
  categoryColors,
  categoryIconPaths,
} from "@/data/pulseCheckCards";
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

// Import sidebar component
import YourJourneySidebar from "@/components/YourJourneySidebar";

// Import shadcn/ui Drawer components and Menu icon for the sidebar functionality
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const PulseCheck = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: "keep" | "pass" }>(
    {}
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [cardSequence, setCardSequence] = useState<PulseCheckCard[]>([]);
  const [showResultsOption, setShowResultsOption] = useState(false);

  // State for mobile bar graph collapse/expand, controlled here in PulseCheck
  const [isMobileBarsCollapsed, setIsMobileBarsCollapsed] = useState(true);

  // State to determine if we are on a mobile screen size (client-side detection for conditional click)
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // State to manage the mobile sidebar drawer open/close
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileScreen(window.innerWidth < 768); // Tailwind's 'md' breakpoint
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const toggleMobileBars = () => {
    setIsMobileBarsCollapsed((prev) => !prev);
  };

  const getGradientColors = (categoryName: string) => {
    switch (categoryName) {
      case "Career":
        return { start: "#8B5CF6", end: "#EC4899" };
      case "Finances":
        return { start: "#3B82F6", end: "#06B6D4" };
      case "Health":
        return { start: "#10B981", end: "#14B8A6" };
      case "Connections":
        return { start: "#F59E0B", end: "#F97316" };
      default:
        return { start: "#8B5CF6", end: "#EC4899" };
    }
  };

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
  const categoryProgressDataForComponents = [
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
    <div className="min-h-screen bg-[#16161a] text-white overflow-hidden flex">
      {/* Container for main content and sidebar */}
      <div className="flex-1 flex flex-col">
        {" "}
        {/* This div will take up the main content area and stack header/body */}
        <Header /> {/* Header is now inside this main content area */}
        <div className="flex-1 p-4 md:p-4">
          {" "}
          {/* This flex-1 div contains the Pulse Check content */}
          {/* Results Section - Now wrapped to accommodate mobile drawer */}
          {isCompleted && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-6xl mx-auto text-center">
                <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Your Pulse Check Results
                </h1>

                <div className="flex justify-center items-center relative">
                  {/* Mobile Menu Trigger (Hamburger) - visible only on small screens */}
                  <div className="md:hidden absolute top-0 right-0">
                    <Drawer
                      direction="right"
                      open={isSidebarDrawerOpen}
                      onOpenChange={setIsSidebarDrawerOpen}
                    >
                      <DrawerTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                          <Menu className="h-6 w-6" />
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent className="w-80 bg-gray-800 border-l border-gray-700 h-full mt-0 fixed bottom-0 right-0 rounded-none">
                        <DrawerHeader>
                          <DrawerTitle className="sr-only">
                            Your Journey Menu
                          </DrawerTitle>
                          <DrawerDescription className="sr-only">
                            Navigation for your journey steps
                          </DrawerDescription>
                        </DrawerHeader>
                        <YourJourneySidebar />{" "}
                        {/* Render the reusable sidebar component here */}
                        <DrawerFooter className="p-4 border-t border-gray-700">
                          <DrawerClose asChild>
                            <Button
                              variant="outline"
                              className="border-gray-600 text-white hover:bg-gray-700"
                            >
                              Close
                            </Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  </div>
                </div>

                {aiLoading && (
                  <div className="mb-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                    <p className="text-gray-300">
                      Analyzing your responses with AI...
                    </p>
                  </div>
                )}

                {aiResults && !aiLoading && (
                  <>
                    <div className="mb-6 md:mb-8">
                      <RadarChart
                        data={aiResults}
                        insights={aiResults.insights}
                        confidenceLevel={confidenceLevelValue}
                      />
                    </div>

                    <div className="flex justify-center mb-6 md:mb-8">
                      <PulseCheckActions data={aiResults} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {/* Pulse Check Interface */}
          {!isCompleted && cardSequence.length > 0 && (
            <div className="flex-1 flex flex-col">
              {/* Header section with title and description */}
              <div className="text-center py-3 md:py-6 px-4">
                <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Life Path Pulse Check
                </h1>
                <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto">
                  Swipe through insights about your life across four key areas.
                  Keep what resonates, pass what doesn't.
                </p>
              </div>

              {/* Category Progress (Rings - Always shown, non-clickable) */}
              <CategoryProgress
                categories={categoryProgressDataForComponents}
              />

              {/* Mobile-only Collapsible Bar Graph Section */}
              <div
                className={`block md:hidden w-full max-w-5xl mx-auto px-4 sm:px-0 mb-4`}
              >
                <div
                  onClick={isMobileScreen ? toggleMobileBars : undefined}
                  className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 cursor-pointer transition-all duration-300 ease-in-out overflow-hidden`}
                >
                  <div
                    className={`space-y-4 py-4 px-6 transition-all duration-300 ease-in-out ${
                      isMobileBarsCollapsed
                        ? "max-h-0 opacity-0"
                        : "max-h-[200px] opacity-100"
                    }`}
                  >
                    {categoryProgressDataForComponents.map((category) => {
                      const categoryColor =
                        categoryColors[
                          category.name as keyof typeof categoryColors
                        ];
                      const percentage =
                        category.total > 0
                          ? (category.completed / category.total) * 100
                          : 0;
                      return (
                        <div
                          key={category.name}
                          className="flex items-center gap-4"
                        >
                          <span
                            className={`text-sm font-semibold w-24 flex-shrink-0 ${categoryColor.text} pl-2`}
                          >
                            {category.name}
                          </span>
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${percentage}%`,
                                background: `linear-gradient(to right, ${
                                  getGradientColors(category.name).start
                                }, ${getGradientColors(category.name).end})`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400 font-medium w-10 text-right pr-2">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Confidence Level Bar */}
              <ConfidenceLevelBar value={confidenceLevelValue} />

              {/* "See Results Now" option - conditional display */}
              <div className="text-center mb-4">
                {showResultsOption && !isCompleted && (
                  <button
                    onClick={handleShowResults}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-base"
                  >
                    See Results Now
                  </button>
                )}
                <p className="text-gray-400 text-sm mt-2">
                  {showResultsOption && !isCompleted
                    ? "You can see your results now, or continue swiping."
                    : "Answer at least one question from each category to see results."}
                </p>
              </div>

              {/* Main card swiping area */}
              <div className="flex-1 flex items-center justify-center px-4 md:px-8 pb-4 md:pb-8">
                <div className="relative w-full max-w-md h-[250px] md:h-96 lg:h-[500px]">
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

                  {visibleCards.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-semibold mb-4">All done!</p>
                        <button
                          onClick={handleShowResults}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-base"
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
      </div>
      {/* Progress Bar Sidebar - Always visible on desktop (md and up) */}
      <div className="hidden md:block w-80 bg-gray-800 border-l border-gray-700 flex flex-col justify-end">
        <YourJourneySidebar />{" "}
        {/* Render the reusable sidebar component here */}
      </div>
    </div>
  );
};

export default PulseCheck;
