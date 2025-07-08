import React, { useState, useEffect, useRef } from "react"; // Import useRef
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { questionnaireData, QuestionSet } from "./questionnaireData";
import { Pillar } from "@/components/priority-ranking/types";

export type PillarAnswers = Record<string, string>;

interface PillarQuestionsProps {
  pillarName: Pillar;
  focusType: "main" | "secondary" | "maintenance";
  onComplete: (answers: PillarAnswers) => void;
  initialAnswers?: PillarAnswers;
}

export const PillarQuestions: React.FC<PillarQuestionsProps> = ({
  pillarName,
  focusType,
  onComplete,
  initialAnswers = {},
}) => {
  const questionSet: QuestionSet = questionnaireData[pillarName][focusType];

  const [answers, setAnswers] = useState<PillarAnswers>(() => {
    const initialState = {};
    questionSet.questions.forEach((q) => {
      initialState[q.id] = initialAnswers[q.id] || "";
    });
    return initialState;
  });

  // --- START OF FIX ---

  // Use a ref to hold the latest version of the onComplete function.
  // This prevents the main useEffect from re-running just because the parent re-rendered.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    // This effect now ONLY runs when the local `answers` state changes (i.e., when the user types).
    // It calls the latest onComplete function via the ref, breaking the infinite loop.
    if (onCompleteRef.current) {
      onCompleteRef.current(answers);
    }
  }, [answers]); // The dependency array is now stable.

  // --- END OF FIX ---

  if (!questionSet) {
    return <div>Error: Questions not found for this pillar.</div>;
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-white">
          {questionSet.title}
        </h3>
        <p className="text-gray-400 mt-2">{questionSet.subtitle}</p>
      </div>

      {questionSet.questions.map((q) => (
        <div key={q.id} className="space-y-3 text-left">
          <Label htmlFor={q.id} className="font-semibold text-gray-300">
            {q.label}
          </Label>
          <Textarea
            id={q.id}
            value={answers[q.id] || ""}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            placeholder={q.placeholder}
            className="min-h-[100px] bg-gray-800 border-gray-700 text-white"
          />
        </div>
      ))}
    </div>
  );
};
