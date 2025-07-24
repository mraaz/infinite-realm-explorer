import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ClarityRings from "@/components/onboarding-questionnaire/ClarityRings";
import QuestionBox from "@/components/onboarding-questionnaire/QuestionBox";
import OverallProgressBar from "@/components/onboarding-questionnaire/OverallProgressBar";
import { useOnboardingQuestionnaireStore } from "@/store/onboardingQuestionnaireStore";
import { useMobileRings } from "@/hooks/use-mobile-rings";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import PageLoading from "@/components/ui/page-loading"; // Import a loader

const getAuthToken = () => localStorage.getItem("infinitelife_jwt");

const OnboardingQuestionnaire = () => {
  const navigate = useNavigate();
  const { isMobile, isExpanded } = useMobileRings();

  // --- NEW: Get user's completion status from AuthContext ---
  const { completedFutureQuestionnaire, isLoading: isAuthLoading } = useAuth();

  const {
    currentQuestion,
    answers,
    isLoading: isQuestionLoading,
    isCompleted,
    initializeQuestionnaire,
    submitAnswer,
    previousQuestion,
    currentQuestionIndex,
    pillarProgress,
    overallProgress,
  } = useOnboardingQuestionnaireStore();

  // --- NEW: Guardrail Effect ---
  useEffect(() => {
    // Wait for the auth context to finish loading
    if (isAuthLoading) {
      return;
    }
    // If the user has already completed the survey, redirect them
    if (completedFutureQuestionnaire) {
      navigate("/self-discovery-summary");
    }
  }, [completedFutureQuestionnaire, isAuthLoading, navigate]);

  useEffect(() => {
    // Only initialize if the user hasn't completed it yet
    if (!isAuthLoading && !completedFutureQuestionnaire) {
      const token = getAuthToken();
      initializeQuestionnaire(token || undefined);
    }
  }, [initializeQuestionnaire, isAuthLoading, completedFutureQuestionnaire]);

  useEffect(() => {
    if (isCompleted) {
      const redirectTimeout = setTimeout(() => {
        navigate("/self-discovery-summary");
      }, 1000); // Shortened timeout
      return () => clearTimeout(redirectTimeout);
    }
  }, [isCompleted, navigate]);

  const handleSubmitAnswer = (answer: any) => {
    if (currentQuestion) {
      const token = getAuthToken();
      submitAnswer(currentQuestion.id, answer, token || undefined);
    }
  };

  const handlePrevious = () => {
    const token = getAuthToken();
    previousQuestion(token || undefined);
  };

  const getQuestionSpacing = () => {
    if (!isMobile) return "mt-12";
    if (isExpanded) return "mt-4";
    return "mt-2";
  };

  // --- NEW: Show a loading spinner while auth is checked ---
  if (isAuthLoading) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#16161a]">
      <Header />
      <main className="flex-grow flex flex-col items-center px-4 py-4 md:py-8 lg:py-12">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
              Building Your 5-Year Snapshot
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-400">
              Complete each area to unlock your personalised insights.
            </p>
          </div>

          <ClarityRings progress={pillarProgress} threshold={80} />

          <div
            className={cn("transition-all duration-300", getQuestionSpacing())}
          >
            {isQuestionLoading && (
              <div className="text-center text-white py-10">
                <h2 className="text-2xl font-bold">Loading...</h2>
              </div>
            )}
            {isCompleted && (
              <div className="text-center text-white py-10">
                <h2 className="text-2xl font-bold">Questionnaire Complete!</h2>
                <p className="text-gray-400 mt-2">Crafting your summary...</p>
              </div>
            )}
            {!isQuestionLoading && !isCompleted && currentQuestion && (
              <QuestionBox
                key={currentQuestion.id}
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                onSubmit={handleSubmitAnswer}
                isSubmitting={isQuestionLoading}
                onPrevious={handlePrevious}
                isFirstQuestion={currentQuestionIndex === 0}
              />
            )}
          </div>

          {!isCompleted && !isQuestionLoading && (
            <OverallProgressBar value={overallProgress} />
          )}
        </div>
      </main>
    </div>
  );
};

export default OnboardingQuestionnaire;
