
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { futureQuestions, FutureQuestion } from '@/data/futureQuestions';
import { ArrowRight } from 'lucide-react';

type Pillar = 'Career' | 'Financials' | 'Health' | 'Connections';
type Answers = Record<string, string>;

interface DeepDiveProps {
  mainFocus: Pillar;
  secondaryFocus: Pillar;
  onComplete: (answers: Answers) => void;
}

export const DeepDive = ({ mainFocus, secondaryFocus, onComplete }: DeepDiveProps) => {
  const questions = futureQuestions.filter(q => q.type === 'deep_dive' && (q.pillar === mainFocus || q.pillar === secondaryFocus));
  const [answers, setAnswers] = useState<Answers>({});

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const isComplete = questions.every(q => answers[q.id] && answers[q.id].trim() !== '');

  const renderQuestionsForPillar = (pillar: Pillar) => (
    <div key={pillar}>
      <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4 border-b pb-2">Deep Dive: {pillar}</h3>
      {questions.filter(q => q.pillar === pillar).map(q => (
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
  );

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Deep Dive on Your Focus Areas</h2>
        <p className="text-gray-600 mt-2">Let's explore what success looks like in your chosen focus areas.</p>
      </div>
      <div>
        {renderQuestionsForPillar(mainFocus)}
        {renderQuestionsForPillar(secondaryFocus)}
      </div>
      <div className="mt-12 flex justify-end">
        <Button size="lg" disabled={!isComplete} onClick={() => onComplete(answers)}>
          Next <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
};
