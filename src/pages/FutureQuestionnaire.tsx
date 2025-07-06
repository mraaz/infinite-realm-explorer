import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PriorityRanking } from "@/components/PriorityRanking";
import { PillarQuestions } from "@/components/futureQuestionnaire/PillarQuestions";
import { ConfirmationStep } from "@/components/futureQuestionnaire/ConfirmationStep";
import { QuestionnaireSteps } from "@/components/futureQuestionnaire/QuestionnaireSteps";
import { QuestionnaireNavigation } from "@/components/futureQuestionnaire/QuestionnaireNavigation";
import { questionnaireData } from "@/components/futureQuestionnaire/questionnaireData";
import { Pillar } from "@/components/priority-ranking/types";

// Import the new hook
import { useQuestionnaireState } from "@/hooks/useQuestionnaireState";
// This is a placeholder for your actual authentication hook
import { useAuth } from "@/contexts/AuthContext";

const FutureQuestionnaire = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isArchitect } = (location.state || { isArchitect: false }) as {
    isArchitect: boolean;
  };

  // Assume `useAuth` returns { user: object } or { user: null }
  const { user } = useAuth();

  const [step, setStep] = useState(1);

  // All data state is now managed by our custom hook
  const {
    isLoading,
    priorities,
    answers,
    handlePrioritiesComplete,
    handlePillarAnswersUpdate,
  } = useQuestionnaireState(user);

  const handlePrevious = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleNext = () => {
    if (user) {
      // If the user is logged in, this is where you would save to the backend on each "Next" click.
      console.log("User is logged in. Saving progress to backend...");
      // e.g., saveQuestionnaireProgress({ priorities, answers });
    }
    setStep((prev) => prev + 1);
  };

  const handleConfirm = () => {
    const futureQuestionnaireAnswers = { priorities, answers };
    if (user) {
      // Final save to backend
      console.log("User is logged in. Saving final answers to backend...");
    } else {
      // For guests, we can clear localStorage after they've seen their results
      // or prompt them to sign up to save their progress permanently.
      console.log(
        "Guest finished. Consider clearing localStorage or prompting sign-up."
      );
    }
    navigate("/results", {
      state: {
        ...location.state,
        futureQuestionnaire: futureQuestionnaireAnswers,
      },
    });
  };

  const totalSteps = 5;

  const isNextDisabled = () => {
    if (!priorities) return true;
    const checkAnswers = (
      pillarName: Pillar,
      focusType: "main" | "secondary" | "maintenance"
    ) => {
      const pillarAnswerObject = answers[pillarName];
      if (!pillarAnswerObject) return true;
      const questionsForPillar =
        questionnaireData[pillarName][focusType].questions;
      return questionsForPillar.some((q) => !pillarAnswerObject[q.id]);
    };
    switch (step) {
      case 1:
        return !priorities;
      case 2:
        return checkAnswers(priorities.mainFocus, "main");
      case 3:
        return checkAnswers(priorities.secondaryFocus, "secondary");
      case 4:
        return priorities.maintenance.some((p) =>
          checkAnswers(p, "maintenance")
        );
      default:
        return true;
    }
  };

  const renderCurrentStep = () => {
    if (isLoading) {
      return <div className="text-center text-gray-500">Loading...</div>;
    }
    if (!priorities && step > 1) {
      return (
        <div className="text-center text-gray-500">
          Please complete Step 1 first.
        </div>
      );
    }
    switch (step) {
      case 1:
        return (
          <PriorityRanking
            onComplete={handlePrioritiesComplete}
            value={priorities}
          />
        );
      case 2:
        return (
          priorities && (
            <PillarQuestions
              key={priorities.mainFocus}
              pillarName={priorities.mainFocus}
              focusType="main"
              onComplete={(pAnswers) =>
                handlePillarAnswersUpdate(priorities.mainFocus, pAnswers)
              }
              initialAnswers={answers[priorities.mainFocus]}
            />
          )
        );
      case 3:
        return (
          priorities && (
            <PillarQuestions
              key={priorities.secondaryFocus}
              pillarName={priorities.secondaryFocus}
              focusType="secondary"
              onComplete={(pAnswers) =>
                handlePillarAnswersUpdate(priorities.secondaryFocus, pAnswers)
              }
              initialAnswers={answers[priorities.secondaryFocus]}
            />
          )
        );
      case 4:
        return (
          priorities && (
            <div className="space-y-8">
              {priorities.maintenance.map((p) => (
                <PillarQuestions
                  key={p}
                  pillarName={p}
                  focusType="maintenance"
                  onComplete={(pAnswers) =>
                    handlePillarAnswersUpdate(p, pAnswers)
                  }
                  initialAnswers={answers[p]}
                />
              ))}
            </div>
          )
        );
      case 5:
        return (
          <ConfirmationStep
            priorities={priorities}
            answers={answers}
            onConfirm={handleConfirm}
            onPrevious={handlePrevious}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#16161a]">
      <Header />
      <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full max-w-5xl">
          <div className="flex justify-end items-center mb-4 min-h-[40px]">
            {/* ... Cancel Dialog ... */}
          </div>
          <div className="bg-[#1e1e24] p-6 md:p-10 rounded-2xl shadow-lg border border-gray-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Future Self Questionnaire
              </h1>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                This questionnaire is designed to help you define your vision
                for the next five years.
              </p>
            </div>
            <QuestionnaireSteps step={step} isArchitect={isArchitect} />
            <div className="mt-10 min-h-[400px]">{renderCurrentStep()}</div>
            {step < totalSteps && (
              <QuestionnaireNavigation
                step={step}
                onPrevious={step > 1 ? handlePrevious : undefined}
                onNext={handleNext}
                nextDisabled={isNextDisabled()}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FutureQuestionnaire;
