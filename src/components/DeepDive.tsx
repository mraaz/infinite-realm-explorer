
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { futureQuestions } from '@/data/futureQuestions';
import { ArrowRight } from 'lucide-react';

type Pillar = 'Career' | 'Financials' | 'Health' | 'Connections';
type Answers = Record<string, string>;

interface DeepDiveProps {
  pillar: Pillar;
  onComplete: (answers: Answers) => void;
  value?: Answers;
}

export const DeepDive = ({ pillar, onComplete, value }: DeepDiveProps) => {
  const questions = futureQuestions.filter(q => q.type === 'deep_dive' && q.pillar === pillar);
  const [answers, setAnswers] = useState<Answers>(value || {});

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const isComplete = questions.every(q => answers[q.id] && answers[q.id].trim() !== '');

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Deep Dive: {pillar}</h2>
        <p className="text-gray-600 mt-2">Let's explore what success looks like in your {pillar.toLowerCase()} focus area.</p>
      </div>
      <div>
        {questions.map(q => (
          <div key={q.id} className="mb-6">
            <Label htmlFor={q.id} className="text-base font-medium text-gray-700 block mb-2">{q.question}</Label>
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
      <div className="mt-12 flex justify-end">
        <Button size="lg" disabled={!isComplete} onClick={() => onComplete(answers)}>
          Next <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
};
