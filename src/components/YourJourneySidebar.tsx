// src/components/YourJourneySidebar.tsx
"use client";

import React from "react";
import { Check, Star, User, Target, Wrench, FileText } from "lucide-react"; // Import icons

// Define the types for the sidebar steps for clarity and type safety
interface Step {
  id: number;
  title: string;
  icon: React.ElementType; // Lucide icon component
  completed: boolean;
  current: boolean;
  type: "linear" | "branch" | "final";
  value?: "major" | "small" | "ultimate";
}

// Define the sidebar component
export default function YourJourneySidebar() {
  const steps: Step[] = [
    {
      id: 1,
      title: "Pulse Check",
      icon: Target,
      completed: true,
      current: true,
      type: "linear",
    },
    {
      id: 2,
      title: "Future Self",
      icon: User,
      completed: false,
      current: false,
      type: "linear",
    },
  ];

  const branchSteps: Step[] = [
    {
      id: 3,
      title: "Habit Architect",
      icon: Wrench,
      completed: false,
      current: false,
      value: "major",
      type: "branch",
    },
    {
      id: 4,
      title: "Full Questionnaire",
      icon: FileText,
      completed: false,
      current: false,
      value: "small",
      type: "branch",
    },
  ];

  const finalStep: Step = {
    id: 5,
    title: "Your Ideal Self",
    icon: Star,
    completed: false,
    current: false,
    value: "ultimate",
    type: "final",
  };

  // Helper function for stars, now internal to this component
  const getValueStars = (value?: string) => {
    if (value === "major") {
      return <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
    }
    if (value === "small") {
      return <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />;
    }
    return null;
  };

  console.log("--- YourJourneySidebar Component Render ---");
  console.log("Initial steps data:", steps);
  console.log("Initial branchSteps data:", branchSteps);
  console.log("Initial finalStep data:", finalStep);

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 h-full overflow-y-auto">
      <div className="sticky top-6">
        <h3 className="text-lg font-semibold mb-6 text-center">Your Journey</h3>

        <div className="relative">
          {/* Linear steps - centered */}
          <div className="relative flex flex-col items-center">
            {/* Vertical line for linear steps */}
            <div className="absolute left-1/2 top-12 w-0.5 h-20 bg-gray-600 transform -translate-x-0.5"></div>

            {steps.map((step) => {
              // --- DEBUGGING LOGS FOR LINEAR STEPS ---
              console.log(
                `Processing linear step ID: ${step.id}, Title: "${step.title}"`
              );
              console.log(`Linear Step Icon Value:`, step.icon);
              console.log(`Type of Linear Step Icon:`, typeof step.icon);
              // --- END DEBUGGING LOGS ---

              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className="relative flex flex-col items-center mb-8"
                >
                  {/* Step content - title above, completed to the right */}
                  <div className="relative">
                    {/* Title above the circle */}
                    <div className="text-center mb-2">
                      <h4
                        className={`font-medium ${
                          step.completed || step.current
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </h4>
                    </div>

                    {/* Completed status to the right of circle */}
                    {step.completed && (
                      <div className="absolute -right-16 top-1/2 transform -translate-y-1/2">
                        <span className="text-sm text-gray-400">
                          Completed ✓
                        </span>
                      </div>
                    )}

                    {/* Description below for non-completed steps */}
                    {!step.completed && (
                      <div className="text-center mt-2">
                        <p className="text-sm text-gray-500">
                          Next step in your journey
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Step indicator */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      step.completed
                        ? "bg-gray-700 border-gray-600"
                        : step.current
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-700 border-gray-600"
                    }`}
                  >
                    {step.completed ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <Icon
                        className={`w-6 h-6 ${
                          step.current ? "text-gray-400" : "text-gray-400"
                        }`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connection line from Future Self to Choose Your Path */}
          <div className="flex justify-center mb-4">
            <div className="w-0.5 h-8 bg-gray-600"></div>
          </div>

          {/* Choose Your Path pill */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-700 px-4 py-2 rounded-full text-sm text-gray-300 border border-gray-600">
              Choose Your Path
            </div>
          </div>

          {/* Simple spacing */}
          <div className="mb-6"></div>

          {/* Branch steps side by side */}
          <div className="flex gap-8 justify-center mb-8">
            {branchSteps.map((step) => {
              // --- DEBUGGING LOGS FOR BRANCH STEPS ---
              console.log(
                `Processing branch step ID: ${step.id}, Title: "${step.title}"`
              );
              console.log(`Branch Step Icon Value:`, step.icon);
              console.log(`Type of Branch Step Icon:`, typeof step.icon);
              // --- END DEBUGGING LOGS ---

              const Icon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step indicator */}
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 mb-3 ${
                      step.completed
                        ? "bg-purple-500 border-purple-500"
                        : "bg-gray-700 border-gray-600"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        step.completed ? "text-white" : "text-gray-400"
                      }`}
                    />
                  </div>

                  {/* Step content */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h4
                        className={`font-medium text-sm ${
                          step.completed ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </h4>
                      {getValueStars(step.value)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {step.completed
                        ? "Completed ✓"
                        : step.value === "major"
                        ? "High Impact"
                        : "Additional Value"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Convergence lines to final step */}
          <div className="relative">
            {/* Convergence lines */}
            <div className="absolute left-1/4 top-0 w-0.5 h-8 bg-gray-600"></div>
            <div className="absolute right-1/4 top-0 w-0.5 h-8 bg-gray-600"></div>
            <div className="absolute left-1/4 top-8 right-1/4 h-0.5 bg-gray-600"></div>
            <div className="absolute left-1/2 top-8 w-0.5 h-4 bg-gray-600 transform -translate-x-0.5"></div>

            {/* Final step - centered */}
            <div className="flex justify-center pt-12">
              <div className="text-center">
                {/* Final step indicator with special styling */}
                <div
                  className={`relative flex items-center justify-center w-16 h-16 rounded-full border-2 mx-auto mb-3 ${
                    finalStep.completed
                      ? "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-400"
                      : "bg-gray-700 border-gray-600 hover:border-yellow-400 transition-colors"
                  }`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      finalStep.completed
                        ? "text-white fill-white"
                        : "text-gray-400"
                    }`}
                  />
                  {/* Glow effect for final step */}
                  {!finalStep.completed && (
                    <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-20 animate-pulse"></div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <h4
                    className={`font-medium ${
                      finalStep.completed ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    {finalStep.title}
                  </h4>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-xs text-gray-500 max-w-32">
                  {finalStep.completed
                    ? "Journey Complete! 🎉"
                    : "Ultimate destination - unlock your full potential"}
                </p>
              </div>
            </div>
          </div>

          {/* Progress summary */}
          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">Progress Overview</div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-gray-600 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: "20%" }}
                ></div>
              </div>
              <span className="text-xs text-gray-400">1/5</span>
            </div>
            <p className="text-xs text-gray-400">
              Great start! Choose your path ahead - both lead to your ideal
              self.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
