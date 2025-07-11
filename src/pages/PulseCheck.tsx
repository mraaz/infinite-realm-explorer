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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
// Removed uuidv4 import, as it will be generated on the backend
import { useNavigate } from "react-router-dom";

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
  const [isSavingResults, setIsSavingResults] = useState(false);

  const [isMobileBarsCollapsed, setIsMobileBarsCollapsed] = useState(true);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);

  const { user, isLoggedIn, authToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Determine if it's guest mode from URL
  const isGuest =
    new URLSearchParams(window.location.search).get("guest") === "true";

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Effect to check if user has already completed Pulse Check and redirect
  useEffect(() => {
    const checkIfPulseCheckCompleted = async () => {
      if (isLoggedIn && !isGuest && user?.sub && authToken) {
        console.log(
          "Checking if Pulse Check is already completed for user:",
          user.sub
        );
        try {
          // --- REPLACE THIS PLACEHOLDER URL WITH YOUR ACTUAL LAMBDA API GATEWAY ENDPOINT for CHECKING ---
          const checkEndpoint = `https://ffwkwcix01.execute-api.us-east-1.amazonaws.com/prod/pulse-check-data/user/${user.sub}`;

          const response = await fetch(checkEndpoint, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data && data.publicId) {
              console.log(
                "Pulse Check already completed. Redirecting to results page:",
                data.publicId
              );
              navigate(`/pulse-check-results?id=${data.publicId}`);
              toast({
                title: "Welcome Back!",
                description:
                  "You've already completed your Pulse Check. Here are your results.",
              });
              return;
            }
          }
          console.log(
            "No existing Pulse Check data found or issue checking. User can proceed."
          );
        } catch (error) {
          console.error("Error checking existing Pulse Check data:", error);
          toast({
            title: "Error",
            description:
              "Could not verify existing Pulse Check data. You may proceed.",
            variant: "destructive",
          });
        }
      }
    };

    checkIfPulseCheckCompleted();
  }, [isLoggedIn, isGuest, user, authToken, navigate, toast]);

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

  // Trigger save only ONCE after aiResults are loaded AND isCompleted is true, AND user is signed in
  useEffect(() => {
    if (
      isCompleted &&
      aiResults &&
      !aiLoading &&
      !isSavingResults && // Ensure we only try to save once
      isLoggedIn &&
      !isGuest
    ) {
      console.log(
        "AI Results available and user signed in. Attempting to save to DB."
      );
      savePulseCheckResultsToDB(aiResults);
    }
  }, [isCompleted, aiResults, aiLoading, isSavingResults, isLoggedIn, isGuest]); // Added isSavingResults to dependencies

  const savePulseCheckResultsToDB = async (results: typeof aiResults) => {
    if (!user || isGuest || !authToken) {
      console.log(
        "Not saving results: User is not signed in, is a guest, or token is missing."
      );
      toast({
        title: "Sign in to save!",
        description:
          "Your results will be saved if you sign in. Otherwise, you can share an image or PDF.",
        variant: "default",
      });
      return;
    }

    setIsSavingResults(true); // Indicate saving process has started
    try {
      const userId = user.sub;
      const createdAt = new Date().toISOString();

      const payload = {
        userId: userId,
        // publicId is now generated on the backend, removed from payload here
        careerScore: results.Career,
        financesScore: results.Finances,
        healthScore: results.Health,
        connectionsScore: results.Connections,
        careerInsight: results.insights?.Career || "",
        financesInsight: results.insights?.Finances || "",
        healthInsight: results.insights?.Health || "",
        connectionsInsight: results.insights?.Connections || "",
        createdAt: createdAt,
      };

      console.log(
        "Sending Pulse Check results payload to backend for saving:",
        payload
      );

      // --- REPLACE THIS PLACEHOLDER URL WITH YOUR ACTUAL LAMBDA API GATEWAY ENDPOINT for SAVING ---
      const lambdaEndpoint =
        "https://ffwkwcix01.execute-api.us-east-1.amazonaws.com/prod/pulse-check-data";

      const response = await fetch(lambdaEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to save Pulse Check results."
        );
      }

      // Expecting the backend to return the generated publicId
      const responseData = await response.json();
      const receivedPublicId = responseData.publicId; // Assuming publicId is returned

      if (!receivedPublicId) {
        throw new Error("Backend did not return a public ID for the results.");
      }

      console.log(
        "Pulse Check results saved successfully. Public ID:",
        receivedPublicId
      );
      toast({
        title: "Results Saved!",
        description:
          "Your Pulse Check results have been saved to your account.",
      });

      // Redirect to the public results page after successful save, using the ID from backend
      navigate(`/pulse-check-results?id=${receivedPublicId}`);
    } catch (error: any) {
      console.error("Error saving Pulse Check results:", error);
      toast({
        title: "Save Failed",
        description:
          error.message ||
          "Could not save your Pulse Check results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingResults(false);
    }
  };

  const handleRetake = () => {
    setIsCompleted(false);
    setCurrentCardIndex(0);
    setAnswers({});
    setShowResultsOption(false);
    setIsSavingResults(false);

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
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-4 md:p-4">
          {isCompleted && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-6xl mx-auto text-center relative">
                <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Your Pulse Check Results
                </h1>

                <div className="md:hidden absolute top-4 right-4 z-20">
                  <Drawer
                    direction="right"
                    open={isSidebarDrawerOpen}
                    onOpenChange={setIsSidebarDrawerOpen}
                  >
                    <DrawerTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-10 w-10 p-0 rounded-full bg-gray-700 hover:bg-gray-600 border border-gray-600 shadow-lg"
                      >
                        <Menu
                          size={24}
                          style={{
                            background:
                              "linear-gradient(to right, #a855f7, #ec4899)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="w-80 bg-gray-800 border-l border-gray-700 h-full mt-0 fixed bottom-0 right-0 rounded-none overflow-y-auto flex flex-col">
                      <DrawerHeader>
                        <DrawerTitle className="sr-only">
                          Your Journey Menu
                        </DrawerTitle>
                        <DrawerDescription className="sr-only">
                          Navigation for your journey steps
                        </DrawerDescription>
                      </DrawerHeader>
                      <YourJourneySidebar />
                    </DrawerContent>
                  </Drawer>
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
          {!isCompleted && cardSequence.length > 0 && (
            <div className="flex-1 flex flex-col">
              <div className="text-center py-3 md:py-6 px-4">
                <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Life Path Pulse Check
                </h1>
                <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto">
                  Swipe through insights about your life across four key areas.
                  Keep what resonates, pass what doesn't.
                </p>
              </div>

              <CategoryProgress
                categories={categoryProgressDataForComponents}
              />

              <div
                className={`block md:hidden w-full max-w-5xl mx-auto px-4 sm:px-0 mb-4`}
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

              <ConfidenceLevelBar value={confidenceLevelValue} />

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

              <div className="flex-1 flex items-center justify-center px-4 md:px-8 pb-4 md:pb-8">
                <div className="relative w-full max-w-md h-[250px] md:h-96 lg:h-[500px]">
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
      {isCompleted && (
        <div className="hidden md:block w-80 bg-gray-800 border-l border-gray-700 flex flex-col justify-end">
          <YourJourneySidebar />
        </div>
      )}
    </div>
  );
};

export default PulseCheck;
