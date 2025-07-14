
import React from 'react';
import { PriorityRanking } from '@/components/PriorityRanking';
import { DeepDive } from '@/components/DeepDive';
import { MaintenanceBaseline } from '@/components/MaintenanceBaseline';
import { PillarProgress } from '@/components/NewQuadrantChart';
import { Pillar } from '@/components/priority-ranking/types';

type Priorities = { mainFocus: Pillar; secondaryFocus: Pillar; maintenance: Pillar[] };
type Answers = Record<string, string>;

interface StandardFlowProps {
    step: number;
    progress: PillarProgress;
    priorities: Priorities | null;
    answers: Answers;
    onPrioritiesChange: (chosenPriorities: Priorities | null) => void;
    onDeepDiveComplete: (deepDiveAnswers: Answers) => void;
    onMaintenanceComplete: (maintenanceAnswers: Answers) => void;
    onPrevious: () => void;
}

export const StandardFlow: React.FC<StandardFlowProps> = ({
    step,
    progress,
    priorities,
    answers,
    onPrioritiesChange,
    onDeepDiveComplete,
    onMaintenanceComplete,
    onPrevious,
}) => {
    switch (step) {
        case 1:
            return (
            <PriorityRanking
              onComplete={onPrioritiesChange}
              value={priorities}
            />
            );
        case 2:
            if (!priorities) return null;
            return (
                <DeepDive 
                    pillar={priorities.mainFocus as any} 
                    onComplete={onDeepDiveComplete} 
                    value={answers} 
                />
            );
        case 3:
            if (!priorities) return null;
            return (
                <DeepDive 
                    pillar={priorities.secondaryFocus as any} 
                    onComplete={onDeepDiveComplete} 
                    value={answers} 
                />
            );
        case 4:
            if (!priorities) return null;
            return (
                <MaintenanceBaseline 
                    maintenancePillars={priorities.maintenance as any} 
                    onComplete={onMaintenanceComplete} 
                    value={answers} 
                />
            );
        default:
            return null;
    }
};
