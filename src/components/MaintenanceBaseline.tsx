
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { futureQuestions } from '@/data/futureQuestions';
import { Pillar } from '@/components/priority-ranking/types';

type Answers = Record<string, string>;

interface MaintenanceBaselineProps {
  maintenancePillars: Pillar[];
  onComplete: (answers: Answers) => void;
  value?: Answers;
}

export const MaintenanceBaseline = ({ maintenancePillars, onComplete, value }: MaintenanceBaselineProps) => {
  const questions = futureQuestions.filter(
    q => q.type === 'maintenance' && maintenancePillars.includes(q.pillar as Pillar)
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
        <h2 className="text-2xl font-bold text-gray-800">Setting Your Maintenance Baseline</h2>
        <p className="text-gray-600 mt-2">Let's define the "good enough" level for your other pillars to ensure balance.</p>
      </div>
      <div>
        {questions.map(q => (
          <div key={q.id} className="mb-6">
            <Label htmlFor={q.id} className="text-base font-medium text-gray-700 block mb-2">
              <span className="font-bold">{q.pillar}:</span> {q.question}
            </Label>
            <Textarea
              id={q.id}
              value={answers[q.id] || ''}
              onChange={e => handleAnswerChange(q.id, e.target.value)}
              placeholder={q.placeholder}
              rows={3}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
