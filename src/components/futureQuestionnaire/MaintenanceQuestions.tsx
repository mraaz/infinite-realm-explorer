import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

interface MaintenanceQuestionsProps {
  pillarNames: string[];
  onComplete: (answers: Record<string, string>) => void;
  initialAnswers?: Record<string, string>;
}

export const MaintenanceQuestions: React.FC<MaintenanceQuestionsProps> = ({
  pillarNames,
  onComplete,
  initialAnswers = {},
}) => {
  const [answers, setAnswers] = useState(() => {
    // Initialize state with any existing answers, otherwise empty strings
    const initialState = {};
    pillarNames.forEach((name) => {
      initialState[name] = initialAnswers[name] || "";
    });
    return initialState;
  });

  // Update a single pillar's answer
  const handleAnswerChange = (pillarName: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [pillarName]: value }));
  };

  useEffect(() => {
    onComplete(answers);
  }, [answers, onComplete]);

  return (
    <div className="space-y-8 text-left">
      <h3 className="text-xl font-semibold text-white">Maintenance Mode</h3>
      <p className="text-gray-400">
        For the pillars in maintenance, you don't need to make huge leaps. You
        just need to define what "good enough" looks like to keep them in a
        healthy place.
      </p>

      {pillarNames.map((pillarName) => (
        <div key={pillarName} className="space-y-3">
          <label className="font-semibold text-purple-400">{pillarName}</label>
          <Textarea
            value={answers[pillarName]}
            onChange={(e) => handleAnswerChange(pillarName, e.target.value)}
            placeholder={`My minimum standard for ${pillarName} is...`}
            className="min-h-[100px] bg-gray-800 border-gray-700 text-white"
          />
        </div>
      ))}
    </div>
  );
};
