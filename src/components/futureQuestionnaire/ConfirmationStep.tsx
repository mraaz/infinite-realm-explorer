import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { futureQuestions } from "@/data/futureQuestions";
import { QuestionnaireNavigation } from "./QuestionnaireNavigation";
import { Pillar } from "@/components/priority-ranking/types";

interface ConfirmationStepProps {
  isArchitect: boolean;
  priorities: {
    mainFocus: Pillar;
    secondaryFocus: Pillar;
    maintenance: Pillar[];
  } | null;
  answers: Record<string, string>;
  architectAnswers: { identity: string; system: string; proof: string };
  onPrevious: () => void;
  onRetake: () => void;
  onConfirm: () => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  isArchitect,
  priorities,
  answers,
  architectAnswers,
  onPrevious,
  onRetake,
  onConfirm,
}) => {
  const renderStandardConfirmation = () => (
    <div>
      {/* Updated title styles */}
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        Confirm Your Future Self
      </h2>

      {priorities && (
        // Updated card styles for "Your Priorities"
        <div className="bg-gray-800/50 p-6 rounded-xl ring-1 ring-white/10 mb-6 text-left">
          <h3 className="text-xl font-semibold text-white mb-4">
            Your Priorities
          </h3>
          <p className="mb-2 text-gray-300">
            <strong>Main Focus:</strong>{" "}
            <span className="text-purple-400 font-semibold">
              {priorities.mainFocus}
            </span>
          </p>
          <p className="mb-2 text-gray-300">
            <strong>Secondary Focus:</strong>{" "}
            <span className="font-semibold">{priorities.secondaryFocus}</span>
          </p>
          <p className="text-gray-300">
            <strong>Maintenance Pillars:</strong>{" "}
            {priorities.maintenance.join(", ")}
          </p>
        </div>
      )}

      {Object.keys(answers).length > 0 && (
        // Updated card styles for "Your Plan"
        <div className="bg-gray-800/50 p-6 rounded-xl ring-1 ring-white/10 mb-6 text-left">
          <h3 className="text-xl font-semibold text-white mb-4">Your Plan</h3>
          {Object.entries(answers)
            .sort(
              ([keyA], [keyB]) =>
                futureQuestions.findIndex((q) => q.id === keyA) -
                futureQuestions.findIndex((q) => q.id === keyB)
            )
            .map(([key, value]) => {
              const question = futureQuestions.find((q) => q.id === key);
              if (!question) return null;
              return (
                <div
                  key={key}
                  className="mb-4 border-b border-gray-700 pb-4 last:border-b-0 last:pb-0"
                >
                  <p className="font-semibold text-gray-300">
                    {question.question}
                  </p>
                  <p className="text-gray-400 pl-4 mt-1 italic">"{value}"</p>
                </div>
              );
            })}
        </div>
      )}

      <QuestionnaireNavigation
        step={5}
        isArchitect={false}
        onPrevious={onPrevious}
        onRetake={onRetake}
        onConfirm={onConfirm}
        showRetake={true}
        showConfirm={true}
      />
    </div>
  );

  const renderArchitectConfirmation = () => (
    <div>
      {/* Updated title styles */}
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        Confirm Your Future Identity
      </h2>

      <div className="space-y-6">
        {/* Updated card styles for Architect flow */}
        <Card className="bg-gray-800/50 border-none ring-1 ring-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-lg text-gray-200">
              Your Chosen Identity
            </CardTitle>
            <p className="text-sm text-gray-400">
              Step 1: The person you will become.
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 italic">
              "{architectAnswers.identity || "Not set"}"
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-none ring-1 ring-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-lg text-gray-200">
              Your Core System
            </CardTitle>
            <p className="text-sm text-gray-400">
              Step 2: The habits that will forge your identity.
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 italic">
              "{architectAnswers.system || "Not set"}"
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-none ring-1 ring-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-lg text-gray-200">
              Your Proof of Identity
            </CardTitle>
            <p className="text-sm text-gray-400">
              Step 3: Your first step on this new path.
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 italic">
              "{architectAnswers.proof || "Not set"}"
            </p>
          </CardContent>
        </Card>
      </div>

      <QuestionnaireNavigation
        step={4}
        isArchitect={true}
        onPrevious={onPrevious}
        onRetake={onRetake}
        onConfirm={onConfirm}
        showRetake={true}
        showConfirm={true}
      />
    </div>
  );

  return isArchitect
    ? renderArchitectConfirmation()
    : renderStandardConfirmation();
};
