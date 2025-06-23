import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { futureQuestions } from "@/data/futureQuestions";
import { Pillar } from "@/components/priority-ranking/types";

type Answers = Record<string, string>;

interface MaintenanceBaselineProps {
  maintenancePillars: Pillar[];
  onComplete: (answers: Answers) => void;
  value?: Answers;
}

export const MaintenanceBaseline = ({
  maintenancePillars,
  onComplete,
  value,
}: MaintenanceBaselineProps) => {
  const questions = futureQuestions.filter(
    (q) =>
      q.type === "maintenance" &&
      maintenancePillars.includes(q.pillar as Pillar)
  );
  const [answers, setAnswers] = useState<Answers>(value || {});

  const handleAnswerChange = (questionId: string, newValue: string) => {
    const updatedAnswers = { ...answers, [questionId]: newValue };
    setAnswers(updatedAnswers);
    onComplete(updatedAnswers);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        {/* Updated text colors for dark theme */}
        <h2 className="text-2xl font-bold text-white">
          Setting Your Maintenance Baseline
        </h2>
        <p className="text-gray-400 mt-2">
          Let's define the "good enough" level for your other pillars to ensure
          balance.
        </p>
      </div>
      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.id}>
            {/* Updated label color for dark theme */}
            <Label
              htmlFor={q.id}
              className="text-base font-medium text-gray-300 block mb-2"
            >
              <span className="font-bold">{q.pillar}:</span> {q.question}
            </Label>
            {/* Updated textarea styles for dark theme */}
            <Textarea
              id={q.id}
              value={answers[q.id] || ""}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              placeholder={q.placeholder}
              rows={3}
              className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
