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
    setAnswers,
  } = useQuestionnaireState(user);

  console.log("🔧 FutureQuestionnaire state:", {
    step,
    priorities,
    answersCount: Object.keys(answers).length,
    isArchitect
  });

  const handlePrevious = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleNext = async () => {
    setSaveError(null);
    console.log("⏭️ Moving to next step from:", step);
    
    if (user && authToken) {
      setIsSaving(true);
      try {
        await saveQuestionnaireProgress({ priorities, answers }, authToken);
        console.log("💾 Progress saved successfully");
        setStep((prev) => prev + 1);
      } catch (error: any) {
        console.error("❌ Save error:", error);
        setSaveError("Failed to save progress. Please try again.");
      } finally {
        setIsSaving(false);
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleConfirm = async () => {
    console.log("✅ Confirming questionnaire with data:", { priorities, answers });
    
    // Handle AWS backend format safely
    if (answers?.history && Array.isArray(answers.history)) {
      console.log("📊 AWS format - conversation history length:", answers.history.length);
    } else {
      console.log("📊 Traditional format - answer keys:", Object.keys(answers));
    }

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

  const totalSteps = 3;

  const isNextDisabled = (): boolean => {
    if (isSaving) return true;
    if (!priorities) return true;

    console.log("🔍 Checking if next is disabled for step:", step, {
      priorities,
      answersCount: Object.keys(answers).length
    });

    switch (step) {
      case 1:
        // Step 1 is complete when all priorities are set
        const step1Complete = (
          priorities.mainFocus &&
          priorities.secondaryFocus &&
          priorities.maintenance.length === 2
        );
        console.log("Step 1 complete:", step1Complete);
        return !step1Complete;
      case 2:
        // Step 2 is complete when all 6 dialogues are finished
        // Check if answers has the AWS backend format (history array)
        console.log("🔍 Step 2 check - answers structure:", answers);
        
        if (answers && answers.history && Array.isArray(answers.history)) {
          const dialogueCount = Math.floor(answers.history.filter(
            (m: any) => m.role === "hero" || m.role === "doubt"
          ).length / 2);
          const step2Complete = dialogueCount >= 6; // 2+2+1+1 dialogues
          console.log("Step 2 complete (6 dialogues finished):", step2Complete, "dialogues:", dialogueCount);
          return !step2Complete;
        }
        
        // Fallback: Check traditional pillar answers format
        const requiredPillars: Pillar[] = [
          priorities.mainFocus,
          priorities.secondaryFocus,
          ...priorities.maintenance,
        ];
        
        const allCategoriesAnswered = requiredPillars.every(pillar => {
          const pillarAnswers = answers[pillar];
          const hasAnswers = pillarAnswers && Object.keys(pillarAnswers).length > 0;
          console.log(`${pillar} has answers:`, hasAnswers, pillarAnswers);
          return hasAnswers;
        });
        
        console.log("Step 2 complete (fallback check):", allCategoriesAnswered);
        return !allCategoriesAnswered;
      default:
        return true;
    }
  };

  const renderCurrentStep = (): React.ReactNode => {
    if (isLoading) {
      return <div className="text-center text-gray-500">Loading...</div>;
    }

    console.log("🎨 Rendering step:", step, { priorities, totalAnswers: Object.keys(answers).length });

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
              onComplete={(finalState) => {
                console.log('🎯 AI Chat completed with final state:', finalState);
                
                // Store the AWS backend format directly in answers
                setAnswers(finalState.answers);
                
                // Move to confirmation step
                setStep(3);
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
            isConfirming={false}
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
