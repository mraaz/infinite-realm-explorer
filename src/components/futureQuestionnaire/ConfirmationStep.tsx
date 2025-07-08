// /src/components/futureQuestionnaire/ConfirmationStep.tsx (Modified)

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pillar } from "@/components/priority-ranking/types";
import { questionnaireData } from "./questionnaireData";
import { PrioritiesSummary } from "./PrioritiesSummary";
import { ArrowLeft, Loader2 } from "lucide-react"; // Import Loader2 icon

// --- Type Definitions ---
type Priorities = {
  mainFocus: Pillar;
  secondaryFocus: Pillar;
  maintenance: Pillar[];
};
type PillarAnswers = Record<string, string>;
type Answers = { [key in Pillar]?: PillarAnswers };

// Add the new `isConfirming` prop to the interface
interface ConfirmationStepProps {
  priorities: Priorities | null;
  answers: Answers;
  onConfirm: () => void;
  onPrevious: () => void;
  isConfirming: boolean; // This prop will control the loading state
}

const AnswerSummary: React.FC<{
  pillarName: Pillar;
  pillarAnswers?: PillarAnswers;
  focusType: "main" | "secondary" | "maintenance";
}> = ({ pillarName, pillarAnswers, focusType }) => {
  const questionSet = questionnaireData[pillarName]?.[focusType];
  if (!questionSet || !pillarAnswers) return null;
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-purple-400">{pillarName}</h4>
      <div className="space-y-4 pl-4 border-l-2 border-gray-700">
        {questionSet.questions.map((q) => (
          <div key={q.id}>
            <Label className="text-sm text-gray-400">{q.label}</Label>
            <p className="text-white whitespace-pre-wrap mt-1">
              {pillarAnswers[q.id] || "No answer provided."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  priorities,
  answers,
  onConfirm,
  onPrevious,
  isConfirming, // Destructure the new prop
}) => {
  if (!priorities) {
    return <div className="text-center text-gray-400">Loading summary...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white">
          Your Future Self Blueprint
        </h3>
        <p className="text-gray-400 mt-2">
          Review your answers below. This is the foundation for the habits
          you're about to build.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm uppercase font-bold text-gray-500 tracking-wider">
          Your Priorities
        </h3>
        <PrioritiesSummary priorities={priorities} />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm uppercase font-bold text-gray-500 tracking-wider">
          Your Answers
        </h3>
        <div className="space-y-8 bg-black/20 rounded-lg p-6">
          <AnswerSummary
            pillarName={priorities.mainFocus}
            pillarAnswers={answers[priorities.mainFocus]}
            focusType="main"
          />
          <AnswerSummary
            pillarName={priorities.secondaryFocus}
            pillarAnswers={answers[priorities.secondaryFocus]}
            focusType="secondary"
          />
          {priorities.maintenance.map((pillar) => (
            <AnswerSummary
              key={pillar}
              pillarName={pillar}
              pillarAnswers={answers[pillar]}
              focusType="maintenance"
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button
          size="lg"
          variant="outline"
          className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
          onClick={onPrevious}
          disabled={isConfirming} // Disable button when confirming
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button size="lg" onClick={onConfirm} disabled={isConfirming}>
          {isConfirming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Show Me My Future Self"
          )}
        </Button>
      </div>
    </div>
  );
};
