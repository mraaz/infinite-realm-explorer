// FutureQuestionnaire.tsx (With Step Persistence)

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { PriorityRanking } from "@/components/PriorityRanking";
import { ConfirmationStep } from "@/components/futureQuestionnaire/ConfirmationStep";
import { QuestionnaireSteps } from "@/components/futureQuestionnaire/QuestionnaireSteps";
import { QuestionnaireNavigation } from "@/components/futureQuestionnaire/QuestionnaireNavigation";
import { AIChatQuestionnaire } from "@/components/futureQuestionnaire/AIChatQuestionnaire";
import { Pillar, Priorities } from "@/components/priority-ranking/types";

// Import hooks and services
import { useQuestionnaireState } from "@/hooks/useQuestionnaireState";
import {
  saveQuestionnaireProgress,
  getQuestionnaireState,
} from "@/services/apiService";
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
  const [isChatComplete, setIsChatComplete] = useState(false);

  const {
    isLoading,
    priorities,
    answers,
    handlePrioritiesComplete,
    handlePillarAnswersUpdate,
  } = useQuestionnaireState(user);

  // --- MODIFICATION 1 of 2: Add a useEffect to load the saved step from the DB for logged-in users ---
  useEffect(() => {
    const fetchInitialStep = async () => {
      if (authToken) {
        const savedState = await getQuestionnaireState(authToken);
        // Ensure we have a valid step number to restore to
        if (
          savedState &&
          savedState.step &&
          savedState.step > 1 &&
          savedState.step <= totalSteps
        ) {
          console.log(`Restoring user to step: ${savedState.step}`);
          setStep(savedState.step);
        }
      }
    };

    fetchInitialStep();
  }, [authToken]); // This runs once when the user's auth token is available.

  const handlePrevious = async () => {
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
    setSaveError(null);
    const targetStep = step + 1;
    console.log("⏭️ Moving to next step:", targetStep);

    if (user && authToken) {
      setIsSaving(true);
      try {
        // --- MODIFICATION 2 of 2: Include the step in the payload ---
        await saveQuestionnaireProgress(
          { priorities, answers, step: targetStep },
          authToken
        );
        console.log("💾 Progress saved successfully");
        setStep(targetStep);
      } catch (error: any) {
        console.error("❌ Save error:", error);
        setSaveError("Failed to save progress. Please try again.");
      } finally {
        setIsSaving(false);
      }
    } else {
      setStep(targetStep);
    }
  };

  const handleConfirm = async () => {
    console.log("✅ Confirming questionnaire with data:", {
      priorities,
      answers,
    });
    const finalPayload = { priorities, answers, step: 3 }; // Save final step as 3
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

  const totalSteps = 3;

  const isNextDisabled = (): boolean => {
    if (isSaving) return true;
    if (!priorities) return true;

    switch (step) {
      case 1:
        return !(
          priorities.mainFocus &&
          priorities.secondaryFocus &&
          priorities.maintenance.length === 2
        );
      case 2:
        return !isChatComplete;
      default:
        return true;
    }
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
              onComplete={(completeAnswers) => {
                Object.entries(completeAnswers).forEach(
                  ([pillar, pillarAnswers]) => {
                    handlePillarAnswersUpdate(pillar as Pillar, pillarAnswers);
                  }
                );
                setIsChatComplete(true);
              }}
            />
          )
        );
      case 3:
        return (
          <ConfirmationStep
            priorities={priorities}
            answers={answers}
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
            <QuestionnaireSteps step={step} isArchitect={isArchitect} />
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
