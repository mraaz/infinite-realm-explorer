import React, { useEffect } from "react";
import Header from "@/components/Header";
import ClarityRings from "@/components/onboarding-questionnaire/ClarityRings";
import QuestionBox from "@/components/onboarding-questionnaire/QuestionBox";
import OverallProgressBar from "@/components/onboarding-questionnaire/OverallProgressBar";
import { useOnboardingQuestionnaireStore } from "@/store/onboardingQuestionnaireStore";

// A simple utility to get the token from localStorage.
// You can replace this with your existing authentication context or hook.
const getAuthToken = () => localStorage.getItem("session_jwt");

const OnboardingQuestionnaire = () => {
  // Select the new state and actions from our updated store
  const {
    currentQuestion,
    answers,
    pillarProgress,
    isLoading,
    isCompleted,
    initializeQuestionnaire,
    submitAnswer,
  } = useOnboardingQuestionnaireStore();

  // --- NEW --- Initialize the questionnaire on component mount
  useEffect(() => {
    const token = getAuthToken();
    initializeQuestionnaire(token || undefined);
  }, [initializeQuestionnaire]);

  // --- REMOVED --- The complex useMemo for calculating progress is no longer needed.
  // The backend now provides this data as `pillarProgress`.

  const handleSubmitAnswer = (answer: any) => {
    if (currentQuestion) {
      const token = getAuthToken();
      submitAnswer(currentQuestion.id, answer, token || undefined);
    }
  };

  // The overall progress can now be an average of the pillar percentages
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

          {/* --- MODIFIED --- Pass the new pillarProgress state from the store */}
          <ClarityRings progress={pillarProgress} threshold={80} />

          <div className="mt-12">
            {/* --- NEW --- Handle loading and completed states */}
            {isLoading && (
              <div className="text-center text-white py-10">
                <h2 className="text-2xl font-bold">Loading...</h2>
              </div>
            )}

            {isCompleted && (
              <div className="text-center text-white py-10">
                <h2 className="text-2xl font-bold">Questionnaire Complete!</h2>
                <p className="text-gray-400 mt-2">
                  Calculating your results...
                </p>
              </div>
            )}

            {/* Render the question box only when not loading, not completed, and a question exists */}
            {!isLoading && !isCompleted && currentQuestion && (
              <QuestionBox
                key={currentQuestion.id} // The key is crucial for React to remount the component
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                // --- MODIFIED --- Pass a single onSubmit handler
                onSubmit={handleSubmitAnswer}
                isSubmitting={isLoading} // Pass loading state to disable the button
              />
            )}
          </div>

          {/* Only show the progress bar while the questionnaire is active */}
          {!isCompleted && !isLoading && (
            <OverallProgressBar value={overallPercentage} />
          )}
        </div>
      </main>
    </div>
  );
};

export default OnboardingQuestionnaire;
