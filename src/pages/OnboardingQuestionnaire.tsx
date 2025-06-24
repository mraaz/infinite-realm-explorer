import React, { useMemo } from "react";
import Header from "@/components/Header";
import ClarityRings from "@/components/onboarding-questionnaire/ClarityRings";
import QuestionBox from "@/components/onboarding-questionnaire/QuestionBox";
import OverallProgressBar from "@/components/onboarding-questionnaire/OverallProgressBar";
// --- THIS IS THE FIX: Import 'questions' directly ---
import {
  useOnboardingQuestionnaireStore,
  questions,
} from "@/store/onboardingQuestionnaireStore";

const OnboardingQuestionnaire = () => {
  // Select only the state and actions needed
  const {
    currentQuestionIndex,
    answers,
    answerQuestion,
    nextQuestion,
    previousQuestion,
  } = useOnboardingQuestionnaireStore();

  const currentQuestion = questions[currentQuestionIndex];

  // This calculation is safe here
  const { overallPercentage, pillarPercentages } = useMemo(() => {
    const answeredQuestions = Object.keys(answers).length;
    const totalQuestions = questions.length;
    const overall =
      totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    const pillars = { career: 0, financials: 0, health: 0, connections: 0 };
    Object.keys(answers).forEach((questionId) => {
      const question = questions.find((q) => q.id === questionId);
      if (question && question.pillar !== "Basics") {
        const pillarKey = question.pillar.toLowerCase() as keyof typeof pillars;
        const pillarQuestions = questions.filter(
          (q) => q.pillar === question.pillar
        );
        const totalPillarQuestions =
          pillarQuestions.length > 0 ? pillarQuestions.length : 1;
        pillars[pillarKey] += 100 / totalPillarQuestions;
      }
    });
    return { overallPercentage: overall, pillarPercentages: pillars };
  }, [answers]);

  const clarityThreshold = 80;

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

          <ClarityRings
            progress={pillarPercentages}
            threshold={clarityThreshold}
          />

          <div className="mt-12">
            {currentQuestion ? (
              <QuestionBox
                key={currentQuestion.id}
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                // --- THIS IS THE FIX: Pass all actions down as props ---
                answerQuestion={answerQuestion}
                nextQuestion={nextQuestion}
                previousQuestion={previousQuestion}
                isFirstQuestion={currentQuestionIndex === 0}
              />
            ) : (
              <div className="text-center text-white py-10">
                <h2 className="text-2xl font-bold">Questionnaire Complete!</h2>
                <p className="text-gray-400 mt-2">
                  Calculating your results...
                </p>
              </div>
            )}
          </div>

          {currentQuestion && <OverallProgressBar value={overallPercentage} />}
        </div>
      </main>
    </div>
  );
};

export default OnboardingQuestionnaire;
