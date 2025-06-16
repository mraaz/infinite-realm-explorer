
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { futureQuestions } from '@/data/futureQuestions';
import { QuestionnaireNavigation } from './QuestionnaireNavigation';
import { Pillar } from '@/components/priority-ranking/types';

interface ConfirmationStepProps {
    isArchitect: boolean;
    priorities: { mainFocus: Pillar; secondaryFocus: Pillar; maintenance: Pillar[] } | null;
    answers: Record<string, string>;
    architectAnswers: { identity: string; system: string; proof: string };
    onPrevious: () => void;
    onRetake: () => void;
    onConfirm: () => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
    isArchitect,
    priorities,
    answers,
    architectAnswers,
    onPrevious,
    onRetake,
    onConfirm,
}) => {
    if (isArchitect) {
        return (
            <div>
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Confirm Your Future Identity</h2>
                
                <div className="space-y-6">
                    <Card className="bg-white/80 border-gray-200/80">
                        <CardHeader>
                            <CardTitle className="text-lg text-gray-700">Your Chosen Identity</CardTitle>
                            <CardDescription>Step 1: The person you will become.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 italic">"{architectAnswers.identity || 'Not set'}"</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 border-gray-200/80">
                        <CardHeader>
                            <CardTitle className="text-lg text-gray-700">Your Core System</CardTitle>
                            <CardDescription>Step 2: The habits that will forge your identity.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 italic">"{architectAnswers.system || 'Not set'}"</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 border-gray-200/80">
                        <CardHeader>
                            <CardTitle className="text-lg text-gray-700">Your Proof of Identity</CardTitle>
                            <CardDescription>Step 3: Your first step on this new path.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 italic">"{architectAnswers.proof || 'Not set'}"</p>
                        </CardContent>
                    </Card>
                </div>

                <QuestionnaireNavigation
                    step={4}
                    isArchitect={true}
                    onPrevious={onPrevious}
                    onRetake={onRetake}
                    onConfirm={onConfirm}
                    showRetake={true}
                    showConfirm={true}
                />
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Confirm Your Future Self</h2>
            
            {priorities && (
                <div className="bg-white/80 p-6 rounded-xl shadow-md border border-gray-200/80 mb-6 text-left">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Priorities</h3>
                    <p className="mb-2"><strong>Main Focus:</strong> {priorities.mainFocus}</p>
                    <p className="mb-2"><strong>Secondary Focus:</strong> {priorities.secondaryFocus}</p>
                    <p><strong>Maintenance Pillars:</strong> {priorities.maintenance.join(', ')}</p>
                </div>
            )}

            {Object.keys(answers).length > 0 && (
                <div className="bg-white/80 p-6 rounded-xl shadow-md border border-gray-200/80 mb-6 text-left">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Plan</h3>
                    {Object.entries(answers)
                    .sort(([keyA], [keyB]) => futureQuestions.findIndex(q => q.id === keyA) - futureQuestions.findIndex(q => q.id === keyB))
                    .map(([key, value]) => {
                      const question = futureQuestions.find(q => q.id === key);
                      if (!question) return null;
                      return (
                        <div key={key} className="mb-4 border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                            <p className="font-semibold text-gray-700">{question.question}</p>
                            <p className="text-gray-600 pl-4 mt-1">{value}</p>
                        </div>
                      );
                    })}
                </div>
            )}

            <QuestionnaireNavigation
                step={5}
                isArchitect={false}
                onPrevious={onPrevious}
                onRetake={onRetake}
                onConfirm={onConfirm}
                showRetake={true}
                showConfirm={true}
            />
        </div>
    );
};
