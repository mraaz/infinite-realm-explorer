import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ClarityRings from "@/components/onboarding-questionnaire/ClarityRings";
import QuestionBox from "@/components/onboarding-questionnaire/QuestionBox";
import OverallProgressBar from "@/components/onboarding-questionnaire/OverallProgressBar";
import { useOnboardingQuestionnaireStore } from "@/store/onboardingQuestionnaireStore";
import { useMobileRings } from "@/hooks/use-mobile-rings";
import { cn } from "@/lib/utils";

const getAuthToken = () => localStorage.getItem("infinitelife_jwt");

const OnboardingQuestionnaire = () => {
  const navigate = useNavigate();
  const { isMobile, isExpanded } = useMobileRings();

  // Select state from the store
  const {
    currentQuestion,
    answers,
    isLoading,
    isCompleted,
    initializeQuestionnaire,
    submitAnswer,
    previousQuestion,
    currentQuestionIndex,
  } = useOnboardingQuestionnaireStore();

  const pillarProgress = useOnboardingQuestionnaireStore(
    (state) => state.pillarProgress
  ) || { career: 0, finances: 0, health: 0, connections: 0 };

  useEffect(() => {
    const token = getAuthToken();
    initializeQuestionnaire(token || undefined);
  }, [initializeQuestionnaire]);

  useEffect(() => {
    if (isCompleted) {
      const redirectTimeout = setTimeout(() => {
        navigate("/results");
      }, 2000);
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

  const overallPercentage =
    (pillarProgress.career +
      pillarProgress.finances +
      pillarProgress.health +
      pillarProgress.connections) /
    4;

  // Dynamic spacing based on mobile state
  const getQuestionSpacing = () => {
    if (!isMobile) return "mt-12"; // Desktop: original spacing
    if (isExpanded) return "mt-4"; // Mobile expanded: moderate spacing
    return "mt-2"; // Mobile collapsed: minimal spacing
  };

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

          <div className={cn("transition-all duration-300", getQuestionSpacing())}>
            {isLoading && (
              <div className="text-center text-white py-10">
                <h2 className="text-2xl font-bold">Loading...</h2>
              </div>
            )}
            {isCompleted && (
              <div className="text-center text-white py-10">
                <h2 className="text-2xl font-bold">Questionnaire Complete!</h2>
                <p className="text-gray-400 mt-2">
                  Taking you to your results...
                </p>
              </div>
            )}
            {!isLoading && !isCompleted && currentQuestion && (
              <QuestionBox
                key={currentQuestion.id}
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                onSubmit={handleSubmitAnswer}
                isSubmitting={isLoading}
                onPrevious={handlePrevious}
                isFirstQuestion={currentQuestionIndex === 0}
              />
            )}
          </div>

          {!isCompleted && !isLoading && (
            <OverallProgressBar value={overallPercentage} />
          )}
        </div>
      </main>
    </div>
  );
};

export default OnboardingQuestionnaire;
