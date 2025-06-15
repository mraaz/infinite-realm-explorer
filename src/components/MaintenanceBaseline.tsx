
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { maintenanceQuestions } from '@/data/futureQuestions';

export interface MaintenanceAnswers {
    [key: string]: string;
}

interface MaintenanceBaselineProps {
  maintenancePillars: string[];
  onComplete: (answers: MaintenanceAnswers) => void;
}

const toTitleCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const MaintenanceBaseline = ({ maintenancePillars, onComplete }: MaintenanceBaselineProps) => {
    const initialAnswers = maintenancePillars.reduce((acc, pillar) => ({ ...acc, [pillar]: '' }), {});
    const [answers, setAnswers] = useState<MaintenanceAnswers>(initialAnswers);

    const handleAnswerChange = (pillar: string, value: string) => {
        setAnswers(prev => ({ ...prev, [pillar]: value }));
    };

    const isComplete = maintenancePillars.every(p => answers[p]?.trim() !== '');

    const handleSubmit = () => {
        if (isComplete) {
            onComplete(answers);
        }
    };

    return (
        <div className="text-left max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 text-center">Phase 3: Set Your Maintenance Baseline</h2>
            <p className="text-gray-600 mt-2 mb-6 text-center">
                Great. Now, let's make sure the rest of your life supports your main goals. Even a race car needs good tyres. What's the minimum you need from these areas to thrive?
            </p>

            <div className="space-y-6">
                {maintenancePillars.map(pillar => (
                    <div key={pillar}>
                        <h3 className="text-lg font-bold text-purple-700 mb-2">{toTitleCase(pillar)}</h3>
                        <div className="space-y-2">
                            <label htmlFor={`maintenance-${pillar}`} className="font-semibold text-gray-700 mb-2 block">{maintenanceQuestions[pillar].question}</label>
                            <Textarea 
                                id={`maintenance-${pillar}`}
                                value={answers[pillar]}
                                onChange={(e) => handleAnswerChange(pillar, e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-8">
                <Button onClick={handleSubmit} disabled={!isComplete} size="lg">
                    Confirm Maintenance Plan
                </Button>
            </div>
        </div>
    );
};

export default MaintenanceBaseline;

