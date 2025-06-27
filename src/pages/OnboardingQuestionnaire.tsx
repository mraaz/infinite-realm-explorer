import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ClarityRings from "@/components/onboarding-questionnaire/ClarityRings";
import QuestionBox from "@/components/onboarding-questionnaire/QuestionBox";
import OverallProgressBar from "@/components/onboarding-questionnaire/OverallProgressBar";
import { useOnboardingQuestionnaireStore } from "@/store/onboardingQuestionnaireStore";

const getAuthToken = () => localStorage.getItem("session_jwt");

const OnboardingQuestionnaire = () => {
  const navigate = useNavigate();

  // Select state from the store
  const {
    currentQuestion,
    answers,
    isLoading,
    isCompleted,
    initializeQuestionnaire,
    submitAnswer,
  } = useOnboardingQuestionnaireStore();

  // --- THIS IS THE FIX ---
  // We select pillarProgress separately and provide a fallback default object.
  // This prevents the component from crashing if the state is ever inconsistent.
  const pillarProgress = useOnboardingQuestionnaireStore(
    (state) => state.pillarProgress
  ) || { career: 0, financials: 0, health: 0, connections: 0 };

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

  // This calculation is now safe because pillarProgress is guaranteed to be an object.
  const overallPercentage =
    (pillarProgress.career +
      pillarProgress.financials +
      pillarProgress.health +
      pillarProgress.connections) /
    4;

  return (
    <div className="min-h-screen flex flex-col bg-[#16161a]">
      <Header />
      <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
              Building Your 5-Year Snapshot
            </h1>
            <p className="text-base sm:text-lg text-gray-400">
              Complete each area to unlock your personalized insights.
            </p>
          </div>

          <ClarityRings progress={pillarProgress} threshold={80} />

          <div className="mt-12">
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
