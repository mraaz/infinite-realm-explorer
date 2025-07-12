
import React from "react";
import { CheckCircle } from "lucide-react";

const STEPS = [
  { id: 1, name: "Setting Priorities" },
  { id: 2, name: "AI Chat Journey" },
  { id: 3, name: "Confirmation" },
];

const ARCHITECT_STEPS = [
  { id: 1, name: "Choose Identity" },
  { id: 2, name: "Design System" },
  { id: 3, name: "Define Proof" },
  { id: 4, name: "Confirmation" },
];

interface QuestionnaireStepsProps {
  step: number;
  isArchitect: boolean;
}

export const QuestionnaireSteps: React.FC<QuestionnaireStepsProps> = ({
  step,
  isArchitect,
}) => {
  const stepsToRender = isArchitect ? ARCHITECT_STEPS : STEPS;

  return (
    <nav aria-label="Progress" className="mb-12">
      <ol role="list" className="flex items-center">
        {stepsToRender.map((s, stepIdx) => (
          <li key={s.id} className="relative flex-1">
            <div className="flex flex-col items-center text-center">
              {/* The step circle */}
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors z-10 ${
                  step >= s.id ? "bg-purple-600" : "bg-gray-700"
                }`}
              >
                <span className="text-white font-bold">
                  {step > s.id ? <CheckCircle size={20} /> : s.id}
                </span>
              </div>
              {/* The step name (visible on medium screens and up) */}
              <span
                className={`mt-2 hidden md:block font-medium text-sm transition-colors md:w-24 ${
                  step >= s.id ? "text-purple-400" : "text-gray-500"
                }`}
              >
                {s.name}
              </span>
            </div>

            {/* The connector line */}
            {stepIdx < stepsToRender.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-0.5 transition-colors ${
                  step > s.id ? "bg-purple-600" : "bg-gray-700"
                }`}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
