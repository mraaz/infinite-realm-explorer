import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { PriorityRanking } from "@/components/PriorityRanking";
import { ConfirmationStep } from "@/components/futureQuestionnaire/ConfirmationStep";
import { QuestionnaireSteps } from "@/components/futureQuestionnaire/QuestionnaireSteps";
import { QuestionnaireNavigation } from "@/components/futureQuestionnaire/QuestionnaireNavigation";
import { AIChatQuestionnaire } from "@/components/futureQuestionnaire/AIChatQuestionnaire";
import { Pillar, Priorities } from "@/components/priority-ranking/types";
import { useQuestionnaireState } from "@/hooks/useQuestionnaireState";
import {
  saveQuestionnaireProgress,
  generateBlueprint, // Import the blueprint generator
  Blueprint, // Import the Blueprint type
} from "@/services/apiService";
import { useAuth } from "@/contexts/AuthContext";

const FutureQuestionnaire: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isArchitect } = (location.state || { isArchitect: false }) as {
    isArchitect: boolean;
  };

  const { user, authToken } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isChatComplete, setIsChatComplete] = useState(false);

  // --- MODIFICATION: Add state to hold the generated blueprint ---
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);

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

  // --- MODIFICATION: handleNext now generates the blueprint when moving from step 2 to 3 ---
  const handleNext = async () => {
    setSaveError(null);
    const targetStep = step + 1;

    if (user && authToken) {
      setIsSaving(true);
      try {
        // If moving from chat to confirmation, generate the blueprint
        if (step === 2) {
          console.log("✅ Generating final blueprint...");
          const finalPayload = { priorities, answers, step: 2 };
          const generatedBlueprint = await generateBlueprint(
            finalPayload,
            authToken
          );
          setBlueprint(generatedBlueprint);
        }

        await saveQuestionnaireProgress(
          { priorities, answers, step: targetStep },
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

  // --- MODIFICATION: handleConfirm is now much simpler ---
  const handleConfirm = () => {
    // This function's only job is to navigate to the results page.
    navigate("/results");
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
        // --- MODIFICATION: Pass the blueprint data to the ConfirmationStep ---
        return (
          <ConfirmationStep
            priorities={priorities}
            blueprint={blueprint}
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
