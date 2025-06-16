
import React from 'react';
import { CheckCircle } from 'lucide-react';

const HABIT_BUILDER_STEPS = [
    { id: 1, name: 'Choose Pillar' },
    { id: 2, name: 'Select Archetype' },
    { id: 3, name: 'Build Habit' },
    { id: 4, name: 'Habit Unlocked' },
];

interface QuestionnaireStepsProps {
    step: number;
}

export const QuestionnaireSteps: React.FC<QuestionnaireStepsProps> = ({ step }) => {
    const getCurrentStepNumber = () => {
        switch (step) {
            case 1: return 1; // pillar
            case 2: return 2; // archetype
            case 3: return 3; // habit
            case 4: return 4; // unlocked
            default: return 1;
        }
    };

    const currentStepNumber = getCurrentStepNumber();
    
    return (
        <nav aria-label="Progress" className="mb-12">
            <ol role="list" className="flex items-center justify-between">
                {HABIT_BUILDER_STEPS.map((s, stepIdx) => (
                    <React.Fragment key={s.id}>
                        <li className="flex flex-col items-center text-center w-24">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStepNumber >= s.id ? 'bg-purple-600' : 'bg-gray-300'}`}>
                                <span className="text-white font-bold">{currentStepNumber > s.id ? <CheckCircle size={20} /> : s.id}</span>
                            </div>
                            <span className={`mt-2 block font-medium text-sm ${currentStepNumber >= s.id ? 'text-purple-700' : 'text-gray-500'}`}>{s.name}</span>
                        </li>
                        {stepIdx < HABIT_BUILDER_STEPS.length - 1 && (
                            <div className={`flex-auto border-t-2 ${currentStepNumber > s.id ? 'border-purple-600' : 'border-gray-300'}`} />
                        )}
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
};
