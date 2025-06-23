import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface QuestionnaireNavigationProps {
  step: number;
  isArchitect: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onRetake?: () => void;
  onConfirm?: () => void;
  showRetake?: boolean;
  showConfirm?: boolean;
  nextDisabled?: boolean;
}

export const QuestionnaireNavigation: React.FC<
  QuestionnaireNavigationProps
> = ({
  step,
  isArchitect,
  onPrevious,
  onNext,
  onRetake,
  onConfirm,
  showRetake = false,
  showConfirm = false,
  nextDisabled = false,
}) => {
  const maxStep = isArchitect ? 4 : 5;
  const showPrevious = step > 1;
  const isLastStep = step === maxStep;

  return (
    <div className="flex justify-between items-center mt-8">
      {showPrevious ? (
        // --- Updated "Previous" Button styles ---
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          className="bg-transparent hover:bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:bg-transparent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
      ) : (
        // This div is a placeholder to keep the "Next" button on the right
        <div className="w-24"></div>
      )}

      {isLastStep ? (
        <div className="flex gap-4">
          {showRetake && (
            // --- Updated "Retake" Button styles ---
            <Button
              variant="outline"
              size="lg"
              onClick={onRetake}
              className="bg-transparent hover:bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600"
            >
              Retake Questionnaire
            </Button>
          )}
          {showConfirm && (
            // --- Updated "Confirm" Button styles ---
            <Button
              size="lg"
              onClick={onConfirm}
              className="bg-gradient-cta text-white font-bold transition-all duration-300 transform hover:scale-105"
            >
              Show Me My Future Self
            </Button>
          )}
        </div>
      ) : (
        // --- Updated "Next" Button styles ---
        <Button
          size="lg"
          onClick={onNext}
          disabled={nextDisabled}
          className="bg-gradient-cta text-white font-bold disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
