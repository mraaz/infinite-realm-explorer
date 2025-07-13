// /src/components/futureQuestionnaire/ConfirmationStep.tsx (Modified)

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pillar } from "@/components/priority-ranking/types";
import { questionnaireData } from "./questionnaireData";
import { PrioritiesSummary } from "./PrioritiesSummary";
import { ArrowLeft, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { parseConversationToAnswers } from "@/utils/answerParser";
import { supabase } from "@/integrations/supabase/client";

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

const VisionSummary: React.FC<{
  pillarName: Pillar;
  vision: string;
  focusType: "main" | "secondary" | "maintenance";
}> = ({ pillarName, vision, focusType }) => {
  if (!vision) return null;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        <h4 className="text-lg font-semibold text-purple-400">{pillarName}</h4>
        <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
          {focusType} focus
        </span>
      </div>
      <div className="pl-6 border-l-2 border-yellow-400/30">
        <p className="text-white/90 leading-relaxed italic">
          {vision}
        </p>
      </div>
    </div>
  );
};

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
  const [visionSummaries, setVisionSummaries] = useState<Record<string, string>>({});
  const [isLoadingVision, setIsLoadingVision] = useState(false);
  
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

  // Generate inspiring vision summaries
  useEffect(() => {
    const generateVisionSummaries = async () => {
      if (!priorities || !parsedAnswers || Object.keys(parsedAnswers).length === 0) return;
      
      setIsLoadingVision(true);
      try {
        console.log("🌟 Generating vision summaries...");
        const { data, error } = await supabase.functions.invoke('synthesize-future-vision', {
          body: { priorities, responses: parsedAnswers }
        });
        
        if (error) {
          console.error("❌ Error generating vision summaries:", error);
        } else {
          console.log("✨ Vision summaries generated:", data);
          setVisionSummaries(data || {});
        }
      } catch (error) {
        console.error("❌ Failed to generate vision summaries:", error);
      } finally {
        setIsLoadingVision(false);
      }
    };

    generateVisionSummaries();
  }, [priorities, parsedAnswers]);

  useEffect(() => {
    if (priorities && parsedAnswers && Object.keys(parsedAnswers).length > 0) {
      const blueprintData = {
        priorities,
        answers: parsedAnswers,
        visionSummaries,
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
  }, [priorities, parsedAnswers, visionSummaries, answers]);

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

      {/* Vision Summaries Section */}
      {(isLoadingVision || Object.keys(visionSummaries).length > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm uppercase font-bold text-gray-500 tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Your Future Self Transformation
          </h3>
          <div className="space-y-6 bg-gradient-to-br from-yellow-900/10 to-purple-900/10 rounded-lg p-6 border border-yellow-400/20">
            {isLoadingVision ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-yellow-400 mr-2" />
                <span className="text-yellow-300">Synthesizing your vision...</span>
              </div>
            ) : (
              <>
                <VisionSummary
                  pillarName={priorities.mainFocus}
                  vision={visionSummaries[priorities.mainFocus] || ""}
                  focusType="main"
                />
                <VisionSummary
                  pillarName={priorities.secondaryFocus}
                  vision={visionSummaries[priorities.secondaryFocus] || ""}
                  focusType="secondary"
                />
                {priorities.maintenance.map((pillar) => (
                  <VisionSummary
                    key={pillar}
                    pillarName={pillar}
                    vision={visionSummaries[pillar] || ""}
                    focusType="maintenance"
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm uppercase font-bold text-gray-500 tracking-wider">
          Your Conversation Responses
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
