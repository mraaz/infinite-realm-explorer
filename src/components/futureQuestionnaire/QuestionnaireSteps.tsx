
import React from 'react';
import { CheckCircle } from 'lucide-react';

const STEPS = [
    { id: 1, name: 'Setting Priorities' },
    { id: 2, name: 'Main Focus' },
    { id: 3, name: 'Secondary Focus' },
    { id: 4, name: 'Maintenance' },
    { id: 5, name: 'Confirmation' },
];

const ARCHITECT_STEPS = [
    { id: 1, name: 'Choose Identity' },
    { id: 2, name: 'Design System' },
    { id: 3, name: 'Define Proof' },
    { id: 4, name: 'Confirmation' },
];

interface QuestionnaireStepsProps {
    step: number;
    isArchitect: boolean;
}

export const QuestionnaireSteps: React.FC<QuestionnaireStepsProps> = ({ step, isArchitect }) => {
    const stepsToRender = isArchitect ? ARCHITECT_STEPS : STEPS;
    
    return (
        <nav aria-label="Progress" className="mb-12">
            <ol role="list" className="flex items-center justify-between">
                {stepsToRender.map((s, stepIdx) => (
                    <React.Fragment key={s.id}>
                        <li className="flex flex-col items-center text-center w-24">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= s.id ? 'bg-purple-600' : 'bg-gray-300'}`}>
                                <span className="text-white font-bold">{step > s.id ? <CheckCircle size={20} /> : s.id}</span>
                            </div>
                            <span className={`mt-2 block font-medium text-sm ${step >= s.id ? 'text-purple-700' : 'text-gray-500'}`}>{s.name}</span>
                        </li>
                        {stepIdx < stepsToRender.length - 1 && (
                            <div className={`flex-auto border-t-2 ${step > s.id ? 'border-purple-600' : 'border-gray-300'}`} />
                        )}
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
};
