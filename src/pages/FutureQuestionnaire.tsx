import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { PriorityRanking } from "@/components/PriorityRanking";
import { ConfirmationStep } from "@/components/futureQuestionnaire/ConfirmationStep";
import { QuestionnaireSteps } from "@/components/futureQuestionnaire/QuestionnaireSteps";
import { QuestionnaireNavigation } from "@/components/futureQuestionnaire/QuestionnaireNavigation";
import { AIChatQuestionnaire } from "@/components/futureQuestionnaire/AIChatQuestionnaire";
import { Pillar, Priorities } from "@/components/priority-ranking/types";
import SocialLoginModal from "@/components/SocialLoginModal";
import { useQuestionnaireState } from "@/hooks/useQuestionnaireState";
import {
  saveQuestionnaireProgress,
  generateBlueprint,
  Blueprint,
} from "@/services/apiService";
import { useAuth } from "@/contexts/AuthContext";

const FutureQuestionnaire: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, authToken } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isChatComplete, setIsChatComplete] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const {
    isLoading,
    priorities,
    answers,
    step,
    setStep,
    setAnswers,
    handlePrioritiesComplete,
  } = useQuestionnaireState();

  const totalSteps = 3;

  // --- MODIFICATION: This new useEffect checks for completion on page load ---
  useEffect(() => {
    // After data is loaded from the DB, check if the chat was already completed.
    if (!isLoading && answers?.questionCount) {
      const totalQuestionsAnswered = Object.values(
        answers.questionCount
      ).reduce((sum: number, count: number) => sum + count, 0) as number;

      // Check if 3 or more questions have been answered.
      if ((totalQuestionsAnswered as number) >= 3) {
        setIsChatComplete(true);
      }
    }
  }, [isLoading, answers]); // Re-run this check when data finishes loading.

  useEffect(() => {
    if (answers?.blueprint) {
      setBlueprint(answers.blueprint);
    }
  }, [answers]);

  // --- MODIFICATION: The handlePrevious function now contains the reset logic ---
  const handlePrevious = async () => {
    // If we are on Step 2 (AI Chat) and click previous, reset everything.
    if (step === 2) {
      if (user && authToken) {
        setIsSaving(true);
        try {
          const emptyAnswers = {
            history: [],
            scores: {},
            questionCount: {},
          };
          // Save a blank slate to the DB for answers, and set the step back to 1
          await saveQuestionnaireProgress(
            { priorities, answers: emptyAnswers, step: 1 },
            authToken
          );
          // Clear local storage to be safe
          localStorage.removeItem("futureQuestionnaireGuestProgress");
          // Force a reload to re-trigger all loading hooks from a clean state
          window.location.reload();
        } catch (error) {
          setSaveError("Failed to reset progress. Please try again.");
          setIsSaving(false);
        }
      } else {
        // For guests, just clear local storage and reload
        localStorage.removeItem("futureQuestionnaireGuestProgress");
        window.location.reload();
      }
      return;
    }

    // Standard "go back" logic for other steps (e.g., from step 3 to 2)
    const targetStep = Math.max(step - 1, 1);
    if (user && authToken) {
      await saveQuestionnaireProgress(
        { priorities, answers, step: targetStep },
        authToken
      );
    }
    setStep(targetStep);
  };

  const handleNext = async () => {
    if (!user && step === 1) {
      setIsLoginModalOpen(true);
      return; // Stop the function here
    }

    setSaveError(null);
    const targetStep = step + 1;

    if (user && authToken) {
      setIsSaving(true);
      try {
        let currentAnswers = answers;
        if (step === 2 && !answers.blueprint) {
          const payloadForBlueprint = { priorities, answers };
          const generatedBlueprint = await generateBlueprint(
            payloadForBlueprint,
            authToken
          );
          setBlueprint(generatedBlueprint);
          currentAnswers = { ...answers, blueprint: generatedBlueprint };
          setAnswers(currentAnswers);
        }
        await saveQuestionnaireProgress(
          { priorities, answers: currentAnswers, step: targetStep },
          authToken
        );
        setStep(targetStep);
      } catch (error: any) {
        setSaveError("An error occurred. Please try again.");
      } finally {
        setIsSaving(false);
      }
    } else {
      setStep(targetStep);
    }
  };

  const handleConfirm = () => {
    navigate("/results", {
      state: {
        ...location.state,
        blueprint: answers.blueprint,
      },
    });
  };

  const isNextDisabled = (): boolean => {
    if (isSaving) return true;
    if (step === 1)
      return !(
        priorities?.mainFocus &&
        priorities?.secondaryFocus &&
        priorities?.maintenance.length === 2
      );
    if (step === 2) return !isChatComplete;
    return true;
  };

  const renderCurrentStep = (): React.ReactNode => {
    if (isLoading) {
      return <div className="text-center text-gray-500">Loading...</div>;
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
            <AIChatQuestionnaire
              priorities={priorities}
              onComplete={(completedState) => {
                setAnswers(completedState.answers);
                setIsChatComplete(true);
              }}
            />
          )
        );
      case 3:
        return (
          <ConfirmationStep
            priorities={priorities}
            blueprint={blueprint}
            onConfirm={handleConfirm}
            onPrevious={handlePrevious}
            isConfirming={isSaving}
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
            <QuestionnaireSteps step={step} isArchitect={false} />
            <div className="mt-10 min-h-[400px]">{renderCurrentStep()}</div>
            {step < totalSteps && (
              <>
                {saveError && (
                  <div className="text-center text-red-400 my-4">
                    <p>{saveError}</p>
                  </div>
                )}
                <QuestionnaireNavigation
                  step={step}
                  isArchitect={false}
                  onPrevious={step > 1 ? handlePrevious : undefined}
                  onNext={handleNext}
                  nextDisabled={isNextDisabled()}
                />
              </>
            )}
          </div>
        </div>
      </main>

      <SocialLoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
      />
    </div>
  );
};

export default FutureQuestionnaire;
