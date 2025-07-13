// /src/components/futureQuestionnaire/ConfirmationStep.tsx (Modified)

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pillar } from "@/components/priority-ranking/types";
import { questionnaireData } from "./questionnaireData";
import { PrioritiesSummary } from "./PrioritiesSummary";
import { ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { parseConversationToAnswers } from "@/utils/answerParser";

// --- Type Definitions ---
type Priorities = {
  mainFocus: Pillar;
  secondaryFocus: Pillar;
  maintenance: Pillar[];
};
type PillarAnswers = Record<string, string>;
type Answers = { [key in Pillar]?: PillarAnswers } | any; // Allow AWS backend format

interface ConfirmationStepProps {
  priorities: Priorities | null;
  answers: Answers;
  onConfirm: () => void;
  onPrevious: () => void;
  isConfirming: boolean;
}

const ConversationSummary: React.FC<{
  pillarName: Pillar;
  responses: string[];
  focusType: "main" | "secondary" | "maintenance";
}> = ({ pillarName, responses, focusType }) => {
  if (!responses || responses.length === 0) return null;
  
  const expectedQuestions = focusType === "maintenance" ? 1 : 2;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-lg font-semibold text-purple-400">{pillarName}</h4>
        <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
          {focusType} focus
        </span>
      </div>
      <div className="space-y-3 pl-4 border-l-2 border-purple-500/30">
        {responses.map((response, index) => (
          <div key={index} className="space-y-1">
            <Label className="text-sm text-gray-400 flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              Response {index + 1} of {expectedQuestions}
            </Label>
            <p className="text-white/90 leading-relaxed">
              {response}
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
  isConfirming,
}) => {
  // Parse AWS conversation history if available
  const parsedAnswers = React.useMemo(() => {
    if (!priorities) return {};
    
    console.log("🔍 ConfirmationStep: Parsing answers", { answers, priorities });
    
    // Check if we have AWS backend format (conversation history)
    if (answers?.history && Array.isArray(answers.history)) {
      console.log("📄 Using AWS conversation format");
      return parseConversationToAnswers(answers.history, priorities);
    }
    
    // Fallback to traditional format
    console.log("📄 Using traditional pillar answers format");
    return answers;
  }, [answers, priorities]);

  useEffect(() => {
    if (priorities && parsedAnswers && Object.keys(parsedAnswers).length > 0) {
      const blueprintData = {
        priorities,
        answers: parsedAnswers,
        originalAnswers: answers, // Keep original for backend
        savedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(
          "futureSelfBlueprint",
          JSON.stringify(blueprintData)
        );
        console.log(
          "Future Self Blueprint data has been saved to local storage.",
          blueprintData
        );
      } catch (error) {
        console.error("Failed to save blueprint data to local storage:", error);
      }
    }
  }, [priorities, parsedAnswers, answers]);

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
          Your Insights
        </h3>
        <div className="space-y-8 bg-black/20 rounded-lg p-6">
          <ConversationSummary
            pillarName={priorities.mainFocus}
            responses={parsedAnswers[priorities.mainFocus]?.responses || []}
            focusType="main"
          />
          <ConversationSummary
            pillarName={priorities.secondaryFocus}
            responses={parsedAnswers[priorities.secondaryFocus]?.responses || []}
            focusType="secondary"
          />
          {priorities.maintenance.map((pillar) => (
            <ConversationSummary
              key={pillar}
              pillarName={pillar}
              responses={parsedAnswers[pillar]?.responses || []}
              focusType="maintenance"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 pt-6 border-t border-gray-700">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </Button>
        <Button
          size="lg"
          onClick={onConfirm}
          disabled={isConfirming}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
        >
          {isConfirming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Your Blueprint...
            </>
          ) : (
            "Generate My Future Self Blueprint"
          )}
        </Button>
      </div>
    </div>
  );
};
