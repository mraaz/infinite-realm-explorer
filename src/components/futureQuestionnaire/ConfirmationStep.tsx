import React from "react";
import { Button } from "@/components/ui/button";
import { PrioritiesSummary } from "./PrioritiesSummary";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Priorities, Pillar } from "@/components/priority-ranking/types";
import { Blueprint } from "@/services/apiService"; // Import the Blueprint type

// --- MODIFICATION: The props have changed to accept the blueprint ---
interface ConfirmationStepProps {
  priorities: Priorities | null;
  blueprint: Blueprint | null;
  onConfirm: () => void;
  onPrevious: () => void;
  isConfirming?: boolean;
}

// --- MODIFICATION: New component to display a single part of the blueprint ---
const BlueprintSection: React.FC<{
  title: string;
  summary: string;
  steps: string[];
}> = ({ title, summary, steps }) => (
  <div className="space-y-3">
    <h4 className="text-lg font-semibold text-purple-400">{title}</h4>
    <p className="text-gray-300 whitespace-pre-wrap">{summary}</p>
    <div>
      <h5 className="font-semibold text-gray-200 mb-2">Your First Steps:</h5>
      <ul className="space-y-2 pl-5">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
            <span className="text-gray-300">{step}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  priorities,
  blueprint,
  onConfirm,
  onPrevious,
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
          Here is the AI-generated summary of your vision and your first steps.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm uppercase font-bold text-gray-500 tracking-wider">
          YOUR PRIORITIES
        </h3>
        <PrioritiesSummary priorities={priorities} />
      </div>

      {/* --- MODIFICATION: This section now displays the blueprint --- */}
      <div className="space-y-6 bg-black/20 rounded-lg p-6">
        {!blueprint ? (
          <p className="text-center text-gray-400">
            Generating your blueprint...
          </p>
        ) : (
          <>
            <div className="text-center space-y-2">
              <h4 className="text-lg font-semibold text-purple-400">
                Overall Summary
              </h4>
              <p className="text-gray-300 max-w-2xl mx-auto">
                {blueprint.overallSummary}
              </p>
            </div>
            <hr className="border-gray-700" />
            <BlueprintSection
              title={`Main Focus: ${blueprint.mainFocus.pillar}`}
              summary={blueprint.mainFocus.summary}
              steps={blueprint.mainFocus.actionableSteps}
            />
            <hr className="border-gray-700" />
            <BlueprintSection
              title={`Secondary Focus: ${blueprint.secondaryFocus.pillar}`}
              summary={blueprint.secondaryFocus.summary}
              steps={blueprint.secondaryFocus.actionableSteps}
            />
          </>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 pt-4">
        <Button
          size="lg"
          onClick={onConfirm}
          disabled={!blueprint} // Disable until blueprint is loaded
          className="w-full md:w-auto"
        >
          Finish & View Results
        </Button>
      </div>
    </div>
  );
};
