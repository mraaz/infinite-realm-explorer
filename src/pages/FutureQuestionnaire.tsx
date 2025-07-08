// FutureQuestionnaire.tsx (Refactored for 3-Step AI Chat Flow)

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { PriorityRanking } from "@/components/PriorityRanking";
import { ConfirmationStep } from "@/components/futureQuestionnaire/ConfirmationStep";
import { QuestionnaireSteps } from "@/components/futureQuestionnaire/QuestionnaireSteps";
import { QuestionnaireNavigation } from "@/components/futureQuestionnaire/QuestionnaireNavigation";
// NEW: Import the placeholder for the AI Chat component
import { AIChatQuestionnaire } from "@/components/futureQuestionnaire/AIChatQuestionnaire";
import { Pillar, Priorities } from "@/components/priority-ranking/types";

// Import hooks and services
import { useQuestionnaireState } from "@/hooks/useQuestionnaireState.tsx";
import { saveQuestionnaireProgress } from "@/services/apiService.tsx";
import { useAuth } from "@/contexts/AuthContext";

const FutureQuestionnaire: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isArchitect } = (location.state || { isArchitect: false }) as {
    isArchitect: boolean;
  };

  const { user, authToken } = useAuth();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    isLoading,
    priorities,
    answers,
    handlePrioritiesComplete,
    handlePillarAnswersUpdate,
  } = useQuestionnaireState(user);

  const handlePrevious = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleNext = async () => {
    setSaveError(null);
    if (user && authToken) {
      setIsSaving(true);
      try {
        await saveQuestionnaireProgress({ priorities, answers }, authToken);
        setStep((prev) => prev + 1);
      } catch (error: any) {
        setSaveError("Failed to save progress. Please try again.");
      } finally {
        setIsSaving(false);
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleConfirm = async () => {
    // The final payload no longer includes an 'analysis' key
    const finalPayload = { priorities, answers };
    if (user && authToken) {
      await saveQuestionnaireProgress(finalPayload, authToken);
    }
    localStorage.removeItem("futureQuestionnaireGuestProgress");
    navigate("/results", {
      state: {
        ...location.state,
        futureQuestionnaire: finalPayload,
      },
    });
  };

  // The total number of steps is now 3
  const totalSteps = 3;

  const isNextDisabled = (): boolean => {
    if (isSaving) return true;
    if (!priorities) return true; // Priorities must be set for all steps past 1

    switch (step) {
      case 1:
        // Step 1 is complete when all priorities are set
        return (
          !priorities.mainFocus ||
          !priorities.secondaryFocus ||
          priorities.maintenance.length !== 2
        );
      case 2:
        // Step 2 is complete when the answers object is populated for all required pillars
        const requiredPillars: Pillar[] = [
          priorities.mainFocus,
          priorities.secondaryFocus,
          ...priorities.maintenance,
        ];
        // The button is disabled if any required pillar does not have an entry in the answers object
        return requiredPillars.some((p) => !answers[p]);
      default:
        // Disable by default on the confirmation step
        return true;
    }
  };

  const renderCurrentStep = (): React.ReactNode => {
    if (isLoading) {
      return <div className="text-center text-gray-500">Loading...</div>;
    }

    // Render based on the new 3-step flow
    switch (step) {
      case 1:
        return (
          <PriorityRanking
            onComplete={handlePrioritiesComplete}
            value={priorities}
          />
        );
      case 2:
        // Render the new AI Chat component if priorities are set
        return (
          priorities && (
            <AIChatQuestionnaire
              priorities={priorities}
              // The chat component will call this function with the complete answers object when done
              onComplete={(completeAnswers) => {
                // Update all answers at once and move to confirmation
                Object.entries(completeAnswers).forEach(([pillar, pillarAnswers]) => {
                  handlePillarAnswersUpdate(pillar as any, pillarAnswers);
                });
                setStep(3); // Move to confirmation step
              }}
            />
          )
        );
      case 3:
        // The final confirmation step
        return (
          <ConfirmationStep
            priorities={priorities}
            answers={answers}
            onConfirm={handleConfirm}
            onPrevious={handlePrevious}
            isConfirming={false} // This can be removed or repurposed if needed
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
          <div className="flex justify-end items-center mb-4 min-h-[40px]"></div>
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
            {/* Pass the new totalSteps to the stepper */}
            <QuestionnaireSteps
              step={step}
              isArchitect={isArchitect}
            />
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
                  isArchitect={isArchitect}
                  onPrevious={step > 1 ? handlePrevious : undefined}
                  onNext={handleNext}
                  nextDisabled={isNextDisabled()}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FutureQuestionnaire;
