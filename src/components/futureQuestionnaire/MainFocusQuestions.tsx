import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export type MainFocusAnswer = {
  q1: string;
  q2: string;
  q3: string;
};

interface MainFocusQuestionsProps {
  pillarName: string; // The pillar name is now a required prop
  onComplete: (answers: { mainFocus: MainFocusAnswer }) => void;
  initialAnswers?: MainFocusAnswer;
}

export const MainFocusQuestions: React.FC<MainFocusQuestionsProps> = ({
  pillarName,
  onComplete,
  initialAnswers,
}) => {
  const [answers, setAnswers] = useState<MainFocusAnswer>(
    initialAnswers || { q1: "", q2: "", q3: "" }
  );

  const handleAnswerChange = (
    question: keyof MainFocusAnswer,
    value: string
  ) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  useEffect(() => {
    onComplete({ mainFocus: answers });
  }, [answers, onComplete]);

  return (
    <div className="space-y-6">
      {/* Centered Header Section */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-white">
          Deep Dive: {pillarName}
        </h3>
        <p className="text-gray-400 mt-2">
          Let's explore what success looks like in your{" "}
          {pillarName.toLowerCase()} focus area.
        </p>
      </div>

      {/* Questions remain left-aligned */}
      <div className="space-y-3 text-left">
        <Label htmlFor="q1" className="font-semibold text-gray-300">
          Describe what your ideal future looks like in this area 5 years from
          now.
        </Label>
        <Textarea
          id="q1"
          value={answers.q1}
          onChange={(e) => handleAnswerChange("q1", e.target.value)}
          placeholder="In 5 years from now, I want my career to be..."
          className="min-h-[100px] bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="space-y-3 text-left">
        <Label htmlFor="q2" className="font-semibold text-gray-300">
          What are the 3 most important outcomes you want to achieve?
        </Label>
        <Textarea
          id="q2"
          value={answers.q2}
          onChange={(e) => handleAnswerChange("q2", e.target.value)}
          placeholder="e.g. 1. Outcome 1..."
          className="min-h-[100px] bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="space-y-3 text-left">
        <Label htmlFor="q3" className="font-semibold text-gray-300">
          Why is this important to you? What is your underlying motivation?
        </Label>
        <Textarea
          id="q3"
          value={answers.q3}
          onChange={(e) => handleAnswerChange("q3", e.target.value)}
          placeholder="e.g. This will give me a sense of freedom..."
          className="min-h-[100px] bg-gray-800 border-gray-700 text-white"
        />
      </div>
    </div>
  );
};
