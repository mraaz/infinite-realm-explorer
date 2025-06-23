import React from "react";
import { CheckCircle } from "lucide-react";

const HABIT_BUILDER_STEPS = [
  { id: 1, name: "Choose Pillar" },
  { id: 2, name: "Select Archetype" },
  { id: 3, name: "Build Habit" },
  { id: 4, name: "Habit Unlocked" },
];

interface QuestionnaireStepsProps {
  step: number;
}

export const QuestionnaireSteps: React.FC<QuestionnaireStepsProps> = ({
  step,
}) => {
  return (
    <nav aria-label="Progress" className="mb-12">
      <ol role="list" className="flex items-center">
        {HABIT_BUILDER_STEPS.map((s, stepIdx) => (
          <React.Fragment key={s.id}>
            <li className="relative flex-1">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    step >= s.id ? "bg-purple-600" : "bg-gray-700"
                  }`}
                >
                  <span className="text-white font-bold">
                    {step > s.id ? <CheckCircle size={20} /> : s.id}
                  </span>
                </div>
                <span
                  className={`mt-2 block font-medium text-sm transition-colors duration-300 ${
                    step >= s.id ? "text-purple-400" : "text-gray-500"
                  }`}
                >
                  {s.name}
                </span>
              </div>
            </li>
            {stepIdx < HABIT_BUILDER_STEPS.length - 1 && (
              <div
                className={`flex-auto border-t-2 transition-colors duration-300 ${
                  step > s.id ? "border-purple-600" : "border-gray-700"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};
