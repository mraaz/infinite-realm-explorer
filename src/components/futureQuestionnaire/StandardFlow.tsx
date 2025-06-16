
import React from 'react';
import { PriorityRanking } from '@/components/PriorityRanking';
import { DeepDive } from '@/components/DeepDive';
import { MaintenanceBaseline } from '@/components/MaintenanceBaseline';
import { QuestionnaireNavigation } from './QuestionnaireNavigation';
import { PillarProgress } from '@/components/NewQuadrantChart';
import { Pillar } from '@/components/priority-ranking/types';

type Priorities = { mainFocus: Pillar; secondaryFocus: Pillar; maintenance: Pillar[] };
type Answers = Record<string, string>;

interface StandardFlowProps {
    step: number;
    progress: PillarProgress;
    priorities: Priorities | null;
    answers: Answers;
    onPrioritiesComplete: (chosenPriorities: Priorities) => void;
    onDeepDiveComplete: (deepDiveAnswers: Answers) => void;
    onMaintenanceComplete: (maintenanceAnswers: Answers) => void;
    onPrevious: () => void;
}

export const StandardFlow: React.FC<StandardFlowProps> = ({
    step,
    progress,
    priorities,
    answers,
    onPrioritiesComplete,
    onDeepDiveComplete,
    onMaintenanceComplete,
    onPrevious,
}) => {
    switch (step) {
        case 1:
            return (
                <div>
                    <PriorityRanking 
                        progress={progress} 
                        onComplete={onPrioritiesComplete} 
                        value={priorities} 
                    />
                    <QuestionnaireNavigation
                        step={step}
                        isArchitect={false}
                        onNext={() => priorities && onPrioritiesComplete(priorities)}
                        nextDisabled={!priorities}
                    />
                </div>
            );
        case 2:
            if (!priorities) return null;
            return (
                <div>
                    <DeepDive 
                        pillar={priorities.mainFocus as any} 
                        onComplete={onDeepDiveComplete} 
                        value={answers} 
                    />
                    <QuestionnaireNavigation
                        step={step}
                        isArchitect={false}
                        onPrevious={onPrevious}
                        onNext={() => onDeepDiveComplete(answers)}
                    />
                </div>
            );
        case 3:
            if (!priorities) return null;
            return (
                <div>
                    <DeepDive 
                        pillar={priorities.secondaryFocus as any} 
                        onComplete={onDeepDiveComplete} 
                        value={answers} 
                    />
                    <QuestionnaireNavigation
                        step={step}
                        isArchitect={false}
                        onPrevious={onPrevious}
                        onNext={() => onDeepDiveComplete(answers)}
                    />
                </div>
            );
        case 4:
            if (!priorities) return null;
            return (
                <div>
                    <MaintenanceBaseline 
                        maintenancePillars={priorities.maintenance as any} 
                        onComplete={onMaintenanceComplete} 
                        value={answers} 
                    />
                    <QuestionnaireNavigation
                        step={step}
                        isArchitect={false}
                        onPrevious={onPrevious}
                        onNext={() => onMaintenanceComplete(answers)}
                    />
                </div>
            );
        default:
            return null;
    }
};
