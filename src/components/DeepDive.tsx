
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { deepDiveQuestions } from '@/data/futureQuestions';

export interface DeepDiveAnswers {
    [key: string]: string[];
}
interface DeepDiveProps {
  mainFocus: string;
  secondaryFocus: string;
  onComplete: (answers: DeepDiveAnswers) => void;
}

const toTitleCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const DeepDive = ({ mainFocus, secondaryFocus, onComplete }: DeepDiveProps) => {
    const questionsForMain = deepDiveQuestions[mainFocus].questions;
    const questionsForSecondary = deepDiveQuestions[secondaryFocus].questions;

    const [mainAnswers, setMainAnswers] = useState<string[]>(Array(questionsForMain.length).fill(''));
    const [secondaryAnswers, setSecondaryAnswers] = useState<string[]>(Array(questionsForSecondary.length).fill(''));

    const handleMainAnswerChange = (index: number, value: string) => {
        const newAnswers = [...mainAnswers];
        newAnswers[index] = value;
        setMainAnswers(newAnswers);
    };

    const handleSecondaryAnswerChange = (index: number, value: string) => {
        const newAnswers = [...secondaryAnswers];
        newAnswers[index] = value;
        setSecondaryAnswers(newAnswers);
    };

    const isComplete = mainAnswers.every(a => a.trim() !== '') && secondaryAnswers.every(a => a.trim() !== '');

    const handleSubmit = () => {
        if (isComplete) {
            onComplete({
                [mainFocus]: mainAnswers,
                [secondaryFocus]: secondaryAnswers,
            });
        }
    };
    
    return (
        <div className="text-left max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 text-center">Phase 2: Deep Dive on Your Focus Areas</h2>
            <p className="text-gray-600 mt-2 mb-6 text-center">
                Let's explore what success looks like in your chosen areas.
            </p>

            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-bold text-purple-700 mb-4">Main Focus: {toTitleCase(mainFocus)}</h3>
                    <div className="space-y-6">
                        {questionsForMain.map((q, index) => (
                             <div key={index} className="space-y-2">
                                <label htmlFor={`main-focus-${index}`} className="font-semibold text-gray-700 mb-2 block">{q}</label>
                                <Textarea 
                                    id={`main-focus-${index}`}
                                    value={mainAnswers[index]}
                                    onChange={(e) => handleMainAnswerChange(index, e.target.value)}
                                    rows={3}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-purple-700 mb-4">Secondary Focus: {toTitleCase(secondaryFocus)}</h3>
                    <div className="space-y-6">
                        {questionsForSecondary.map((q, index) => (
                             <div key={index} className="space-y-2">
                                <label htmlFor={`secondary-focus-${index}`} className="font-semibold text-gray-700 mb-2 block">{q}</label>
                                <Textarea 
                                    id={`secondary-focus-${index}`}
                                    value={secondaryAnswers[index]}
                                    onChange={(e) => handleSecondaryAnswerChange(index, e.target.value)}
                                    rows={3}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="text-center mt-8">
                <Button onClick={handleSubmit} disabled={!isComplete} size="lg">
                    Confirm Deep Dive
                </Button>
            </div>
        </div>
    );
};

export default DeepDive;

